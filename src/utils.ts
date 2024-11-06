interface JWTPayload {
  sub?: string;
  exp?: number;
  user_metadata: {
    role?: string;
  };
}

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
  // Determines user role from JWT for access control
  let role = "Anonymous";
  if (header) {
    const parts = header.split(".");
    if (parts.length === 3) {
      try {
        const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
        const payload = JSON.parse(decoded) as JWTPayload;
        const userRole = payload?.user_metadata?.role;

        if (payload.exp && Date.now() >= payload.exp * 1000) {
          return role;
        }

        if (
          userRole &&
          typeof userRole === "string" &&
          ["Admin", "User", "Artist Manager"].includes(userRole)
        ) {
          role = userRole;
        }
      } catch (error) {
        console.error("Error parsing JWT:", error);
      }
    }
  }
  return role;
};

export default {
  parseJWTPayload,
  enforceRole,
};
