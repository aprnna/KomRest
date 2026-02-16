import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import { gunzipSync } from "zlib";
import { config as loadEnv } from "dotenv";

import { Prisma } from "@prisma/client";

import { hashPassword } from "../lib/password";
import { prisma } from "../lib/prisma";

loadEnv({ path: ".env.local" });
loadEnv();

type CopyBlock = {
  columns: string[];
  rows: Array<Array<string | null>>;
};

const DEFAULT_PASSWORD = process.env.MIGRATION_DEFAULT_PASSWORD || "password123";

type TableRow = Record<string, string | null>;

function maybeParseGzip(input: Buffer) {
  if (input[0] === 0x1f && input[1] === 0x8b) {
    return gunzipSync(input).toString("utf8");
  }

  return input.toString("utf8");
}

function parseCopyBlocks(sql: string) {
  const lines = sql.split(/\r?\n/);
  const blocks = new Map<string, CopyBlock>();

  let currentTable: string | null = null;
  let currentColumns: string[] = [];
  let currentRows: Array<Array<string | null>> = [];

  for (const line of lines) {
    if (!currentTable) {
      const copyMatch = line.match(/^COPY\s+([^\s]+)\s+\(([^)]+)\)\s+FROM\s+stdin;$/);

      if (!copyMatch) {
        continue;
      }

      currentTable = copyMatch[1];
      currentColumns = copyMatch[2].split(",").map((col) => col.trim());
      currentRows = [];
      continue;
    }

    if (line === "\\.") {
      blocks.set(currentTable, {
        columns: currentColumns,
        rows: currentRows,
      });
      currentTable = null;
      currentColumns = [];
      currentRows = [];
      continue;
    }

    currentRows.push(line.split("\t").map(parseCell));
  }

  return blocks;
}

function parseCell(input: string) {
  if (input === "\\N") {
    return null;
  }

  return input
    .replace(/\\t/g, "\t")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\\\/g, "\\");
}

function rowsToObjects(block?: CopyBlock): TableRow[] {
  if (!block) {
    return [];
  }

  return block.rows.map((row) => {
    const value: TableRow = {};

    block.columns.forEach((col, index) => {
      value[col] = row[index] ?? null;
    });

    return value;
  });
}

function toBool(value: string | null | undefined) {
  if (value == null) {
    return null;
  }

  if (value === "t" || value === "true" || value === "TRUE") {
    return true;
  }

  if (value === "f" || value === "false" || value === "FALSE") {
    return false;
  }

  return null;
}

function toInt(value: string | null | undefined) {
  if (value == null || value === "") {
    return null;
  }

  return Number.parseInt(value, 10);
}

function toBigInt(value: string | null | undefined) {
  if (value == null || value === "") {
    return null;
  }

  return BigInt(value);
}

function toDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value);
}

function resolveBackupFilePath() {
  const argvPath = process.argv[2]?.trim();

  if (argvPath) {
    return argvPath;
  }

  const envPath = process.env.MIGRATION_BACKUP_FILE?.trim();

  if (envPath) {
    return envPath;
  }

  const cwd = process.cwd();
  const fallbackCandidates = readdirSync(cwd)
    .filter((fileName) => fileName.endsWith(".backup.gz"))
    .sort();

  if (fallbackCandidates.length > 0) {
    return path.join(cwd, fallbackCandidates[0]);
  }

  return null;
}

async function bootstrapAdmin() {
  const managerExists = await prisma.user.findFirst({
    where: {
      role: "manager",
    },
    select: {
      id: true,
    },
  });

  if (managerExists) {
    return;
  }

  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const passwordHash = await hashPassword(password);

  const existing = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    await prisma.user.update({
      where: {
        id: existing.id,
      },
      data: {
        role: "manager",
        passwordHash,
        mustResetPassword: false,
        updatedAt: new Date(),
      },
    });

    return;
  }

  await prisma.user.create({
    data: {
      email,
      nama: "Admin",
      role: "manager",
      passwordHash,
      mustResetPassword: false,
      updatedAt: new Date(),
    },
  });
}

async function resetSequences() {
  const resetSequence = async (tableName: string, columnName: string) => {
    await prisma.$executeRawUnsafe(
      `
      WITH seq AS (
        SELECT pg_get_serial_sequence('${tableName}', '${columnName}') AS seq_name
      ),
      next_val AS (
        SELECT COALESCE(MAX("${columnName}"), 0) + 1 AS value FROM ${tableName}
      )
      SELECT setval(seq.seq_name, next_val.value, false)
      FROM seq, next_val
      WHERE seq.seq_name IS NOT NULL;
      `,
    );
  };

  await resetSequence("public.bahan_baku", "id");
  await resetSequence("public.item_pesanan", "id");
  await resetSequence("public.meja", "no_meja");
  await resetSequence("public.mengelola_bahan", "id");
  await resetSequence("public.menu", "id");
  await resetSequence("public.pesanan", "id");
  await resetSequence("public.reservasi", "id");
}

async function migrateTables(blocks: Map<string, CopyBlock>) {
  const defaultPasswordHash = await hashPassword(DEFAULT_PASSWORD);

  const authUsers = rowsToObjects(blocks.get("auth.users"));
  const publicUsers = rowsToObjects(blocks.get("public.users"));
  const bahanBaku = rowsToObjects(blocks.get("public.bahan_baku"));
  const meja = rowsToObjects(blocks.get("public.meja"));
  const menu = rowsToObjects(blocks.get("public.menu"));
  const reservasi = rowsToObjects(blocks.get("public.reservasi"));
  const pesanan = rowsToObjects(blocks.get("public.pesanan"));
  const itemPesanan = rowsToObjects(blocks.get("public.item_pesanan"));
  const mengelolaBahan = rowsToObjects(blocks.get("public.mengelola_bahan"));

  const emailById = new Map<string, string>();

  for (const user of authUsers) {
    if (user.id && user.email) {
      emailById.set(user.id, user.email.toLowerCase());
    }
  }

  for (const row of publicUsers) {
    const id = row.id;

    if (!id) {
      continue;
    }

    await prisma.user.upsert({
      where: {
        id,
      },
      update: {
        createdAt: toDate(row["createdAt"]) ?? undefined,
        umur: toInt(row.umur),
        role: row.role,
        noTelp: row.no_telp,
        nama: row.nama,
        updatedAt: toDate(row["updatedAt"]),
        email: emailById.get(id) ?? null,
        passwordHash: defaultPasswordHash,
        mustResetPassword: false,
      },
      create: {
        id,
        createdAt: toDate(row["createdAt"]) ?? new Date(),
        umur: toInt(row.umur),
        role: row.role,
        noTelp: row.no_telp,
        nama: row.nama,
        updatedAt: toDate(row["updatedAt"]),
        email: emailById.get(id) ?? null,
        passwordHash: defaultPasswordHash,
        mustResetPassword: false,
      },
    });
  }

  for (const row of bahanBaku) {
    const id = toInt(row.id);

    if (id == null) {
      continue;
    }

    await prisma.bahanBaku.upsert({
      where: { id },
      update: {
        nama: row.nama ?? "",
        jumlah: toInt(row.jumlah) ?? 0,
        satuan: row.satuan,
        status: toBool(row.status) ?? true,
        createdAt: toDate(row["createdAt"]),
      },
      create: {
        id,
        nama: row.nama ?? "",
        jumlah: toInt(row.jumlah) ?? 0,
        satuan: row.satuan,
        status: toBool(row.status) ?? true,
        createdAt: toDate(row["createdAt"]),
      },
    });
  }

  for (const row of meja) {
    const noMeja = toInt(row.no_meja);

    if (noMeja == null) {
      continue;
    }

    await prisma.meja.upsert({
      where: { noMeja },
      update: {
        kapasitas: toInt(row.kapasitas),
        status: row.status,
      },
      create: {
        noMeja,
        kapasitas: toInt(row.kapasitas),
        status: row.status,
      },
    });
  }

  for (const row of menu) {
    const id = toBigInt(row.id);

    if (id == null) {
      continue;
    }

    await prisma.menu.upsert({
      where: { id },
      update: {
        createdAt: toDate(row["createdAt"]) ?? undefined,
        nama: row.nama ?? "",
        harga: new Prisma.Decimal(row.harga ?? "0"),
        tersedia: toBool(row.tersedia) ?? false,
        foto: row.foto,
        kategori: row.kategori ?? "",
      },
      create: {
        id,
        createdAt: toDate(row["createdAt"]) ?? new Date(),
        nama: row.nama ?? "",
        harga: new Prisma.Decimal(row.harga ?? "0"),
        tersedia: toBool(row.tersedia) ?? false,
        foto: row.foto,
        kategori: row.kategori ?? "",
      },
    });
  }

  for (const row of reservasi) {
    const id = toInt(row.id);

    if (id == null) {
      continue;
    }

    await prisma.reservasi.upsert({
      where: { id },
      update: {
        idUser: row.id_user,
        noMeja: toInt(row.no_meja),
        tanggal: toDate(row.tanggal),
        atasNama: row.atas_nama,
        banyakOrang: toInt(row.banyak_orang),
        noTelp: row.no_telp,
        status: row.status,
      },
      create: {
        id,
        idUser: row.id_user,
        noMeja: toInt(row.no_meja),
        tanggal: toDate(row.tanggal),
        atasNama: row.atas_nama,
        banyakOrang: toInt(row.banyak_orang),
        noTelp: row.no_telp,
        status: row.status,
      },
    });
  }

  for (const row of pesanan) {
    const id = toInt(row.id);

    if (id == null) {
      continue;
    }

    await prisma.pesanan.upsert({
      where: { id },
      update: {
        idUser: row.id_user,
        noMeja: toInt(row.no_meja),
        createdAt: toDate(row["createdAt"]) ?? undefined,
        updateAt: toDate(row["updateAt"]),
        totalHarga: row.total_harga != null ? new Prisma.Decimal(row.total_harga) : null,
        status: row.status,
        idReservasi: toInt(row.id_reservasi),
      },
      create: {
        id,
        idUser: row.id_user,
        noMeja: toInt(row.no_meja),
        createdAt: toDate(row["createdAt"]) ?? new Date(),
        updateAt: toDate(row["updateAt"]),
        totalHarga: row.total_harga != null ? new Prisma.Decimal(row.total_harga) : null,
        status: row.status,
        idReservasi: toInt(row.id_reservasi),
      },
    });
  }

  for (const row of itemPesanan) {
    const id = toInt(row.id);

    if (id == null) {
      continue;
    }

    await prisma.itemPesanan.upsert({
      where: { id },
      update: {
        idMenu: toBigInt(row.id_menu),
        idPesanan: toInt(row.id_pesanan),
        jumlah: toInt(row.jumlah),
      },
      create: {
        id,
        idMenu: toBigInt(row.id_menu),
        idPesanan: toInt(row.id_pesanan),
        jumlah: toInt(row.jumlah),
      },
    });
  }

  for (const row of mengelolaBahan) {
    const id = toInt(row.id);

    if (id == null) {
      continue;
    }

    await prisma.mengelolaBahan.upsert({
      where: { id },
      update: {
        idStock: toInt(row.id_stock),
        proses: row.proses,
        jumlah: toInt(row.jumlah),
        createdAt: toDate(row["createdAt"]),
        idUser: row.id_user,
      },
      create: {
        id,
        idStock: toInt(row.id_stock),
        proses: row.proses,
        jumlah: toInt(row.jumlah),
        createdAt: toDate(row["createdAt"]),
        idUser: row.id_user,
      },
    });
  }
}

async function main() {
  const filePath = resolveBackupFilePath();

  if (!filePath) {
    throw new Error(
      "Usage: npm run migrate:backup -- <path-to-backup-file> (or set MIGRATION_BACKUP_FILE)",
    );
  }

  if (!existsSync(filePath)) {
    throw new Error(`Backup file not found: ${filePath}`);
  }

  const content = readFileSync(filePath);
  const sql = maybeParseGzip(content);
  const blocks = parseCopyBlocks(sql);

  await migrateTables(blocks);
  await bootstrapAdmin();
  await resetSequences();

  console.log(`Migration completed. Default password set to: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
