import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  type ObjectCannedACL,
} from "@aws-sdk/client-s3";

type StorageMode = "local" | "s3";

export type StoredFile = {
  key: string;
  publicUrl: string;
};

function getStorageMode(): StorageMode {
  return process.env.STORAGE_DRIVER === "s3" ? "s3" : "local";
}

function sanitizeFileName(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getExtension(file: File) {
  const fromName = file.name?.split(".").pop();

  if (fromName && /^[a-zA-Z0-9]+$/.test(fromName)) {
    return fromName.toLowerCase();
  }

  if (file.type?.includes("/")) {
    return file.type.split("/")[1].toLowerCase();
  }

  return "bin";
}

function createObjectKey(name: string, file: File) {
  const ext = getExtension(file);
  const safeName = sanitizeFileName(name || "menu");

  return `menu/${Date.now()}-${safeName || "menu"}-${randomUUID()}.${ext}`;
}

function getS3Client() {
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials:
      process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function getS3Acl(): ObjectCannedACL | undefined {
  const acl = process.env.S3_ACL?.trim();

  if (!acl) {
    return undefined;
  }

  const allowedAcl: ObjectCannedACL[] = [
    "private",
    "public-read",
    "public-read-write",
    "authenticated-read",
    "aws-exec-read",
    "bucket-owner-read",
    "bucket-owner-full-control",
  ];

  return allowedAcl.includes(acl as ObjectCannedACL) ? (acl as ObjectCannedACL) : undefined;
}

function keyFromUrl(url: string) {
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

  if (publicBaseUrl && url.startsWith(publicBaseUrl)) {
    return url.slice(publicBaseUrl.length).replace(/^\//, "");
  }

  const localPrefix = "/uploads/";

  if (url.startsWith(localPrefix)) {
    return url.replace(localPrefix, "");
  }

  return url;
}

async function uploadLocal(file: File, key: string): Promise<StoredFile> {
  const relativePath = key.replace(/^menu\//, "menu/");
  const baseDir = process.env.STORAGE_LOCAL_BASE_PATH ?? "public/uploads";
  const filePath = path.join(process.cwd(), baseDir, relativePath);

  await mkdir(path.dirname(filePath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return {
    key,
    publicUrl: `/uploads/${relativePath}`,
  };
}

async function uploadS3(file: File, key: string): Promise<StoredFile> {
  const bucket = requireEnv("S3_BUCKET");
  const publicBaseUrl = requireEnv("S3_PUBLIC_BASE_URL");
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || undefined,
      ACL: getS3Acl(),
    }),
  );

  return {
    key,
    publicUrl: `${publicBaseUrl.replace(/\/$/, "")}/${key}`,
  };
}

export async function uploadMenuImage(file: File, menuName: string): Promise<StoredFile> {
  const key = createObjectKey(menuName, file);

  if (getStorageMode() === "s3") {
    return uploadS3(file, key);
  }

  return uploadLocal(file, key);
}

async function deleteLocal(key: string) {
  const baseDir = process.env.STORAGE_LOCAL_BASE_PATH ?? "public/uploads";
  const filePath = path.join(process.cwd(), baseDir, key);

  try {
    await unlink(filePath);
  } catch {
    // ignore missing file
  }
}

async function deleteS3(key: string) {
  const bucket = requireEnv("S3_BUCKET");
  const client = getS3Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export async function deleteStoredImage(keyOrUrl?: string | null) {
  if (!keyOrUrl) {
    return;
  }

  const key = keyFromUrl(keyOrUrl);

  if (!key.startsWith("menu/")) {
    return;
  }

  if (getStorageMode() === "s3") {
    await deleteS3(key);

    return;
  }

  await deleteLocal(key);
}
