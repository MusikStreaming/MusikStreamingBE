import { JWTPayload } from "./models/interfaces";

const parseJWTPayload = (
  header: string | undefined,
): [JWTPayload | { error: string }, number] => {
  if (!header) {
    return [{ error: "Unauthorized" }, 401];
  }

  const parts = header.split(".");
  if (parts.length !== 3) {
    return [{ error: "Invalid token format" }, 401];
  }

  try {
    const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
    const payload = JSON.parse(decoded) as JWTPayload;

    // Validate expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return [{ error: "Token expired" }, 401];
    }

    return [payload, 200];
  } catch (error) {
    return [{ error: "Invalid token payload" }, 401];
  }
};

const enforceRole = (header: string | undefined): string => {
  const [payload, status] = parseJWTPayload(header);

  if ("error" in payload || status !== 200) {
    return "Anonymous";
  }

  const userRole = payload.user_metadata.role;
  return typeof userRole === "string" &&
    ["Admin", "User", "Artist Manager"].includes(userRole)
    ? userRole
    : "Anonymous";
};

export default {
  parseJWTPayload,
  enforceRole,
};
