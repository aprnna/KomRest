import { NextResponse } from "next/server"

export default async function getResponse(data:any, message:string, status:number=200) {
  const serializedData =
    data === undefined
      ? null
      : JSON.parse(
          JSON.stringify(data, (_, value) => {
            if (typeof value === "bigint") {
              return Number(value);
            }

            return value;
          }),
        );

  return NextResponse.json({ data: serializedData, message, status })
}
