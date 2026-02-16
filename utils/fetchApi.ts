import axios from "axios";

export default async function fetchApi(
  path: string,
  method: string,
  body?: any,
) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${apiBaseUrl}${normalizedPath}`;
  const headers = {
    "Content-Type": "application/json",
  };
  const options = {
    method,
    headers,
    ...(body && { data: JSON.stringify(body) }),
  };

  try {
    const response = await axios(url, options);

    return response.data;
  } catch (error:any) {
    console.log(error);

    return error.response?.data ?? { data: null, message: "request failed", status: 500 };
  }
}
