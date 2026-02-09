import { authClient } from "./auth-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const tokenResult = await authClient.token();
  if (tokenResult.error || !tokenResult.data) {
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    throw new Error("Not authenticated");
  }

  const jwt = tokenResult.data.token;

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/signin";
    }
    throw new Error("Not authenticated");
  }

  return response;
}
