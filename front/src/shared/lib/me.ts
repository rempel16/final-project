import { tokenStorage } from "./storage";

const MOCK_ME_ID = "user-1";

const base64UrlToBase64 = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  if (pad === 0) return normalized;
  return normalized + "=".repeat(4 - pad);
};

const decodeJwtPayload = (token: string): unknown => {
  const [, payloadBase64Url] = token.split(".");
  if (!payloadBase64Url) return null;

  const payloadBase64 = base64UrlToBase64(payloadBase64Url);
  const json = atob(payloadBase64);
  return JSON.parse(json) as unknown;
};

export const getMeId = (): string => {
  const token = tokenStorage.get();
  if (!token) return MOCK_ME_ID;

  try {
    const payload = decodeJwtPayload(token);
    if (payload && typeof payload === "object") {
      // Server signs { id: string }
      if (
        "id" in payload &&
        typeof (payload as { id?: unknown }).id === "string"
      ) {
        return (payload as { id: string }).id;
      }
      if (
        "userId" in payload &&
        typeof (payload as { userId?: unknown }).userId === "string"
      ) {
        return (payload as { userId: string }).userId;
      }
      if (
        "sub" in payload &&
        typeof (payload as { sub?: unknown }).sub === "string"
      ) {
        return (payload as { sub: string }).sub;
      }
    }
  } catch {
    // ignore
  }

  return MOCK_ME_ID;
};
