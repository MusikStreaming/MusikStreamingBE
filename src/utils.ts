const parseJWTPayload = (header: string | undefined): [any, number] => {
  if (!header) {
    return [{ error: "Unauthorized" }, 401];
  }

  const parts = header.split(".");
  if (parts.length !== 3) {
    return [{ error: "Invalid token input" }, 500];
  }

  const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
  return [JSON.parse(decoded), 200];
};

const enforceRole = (header: string | undefined): string => {
  // Determines user role from JWT for access control
  let role = "Anonymous";
  if (header) {
    const parts = header.split(".");
    if (parts.length === 3) {
      try {
        const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
        const payload = JSON.parse(decoded);
        const userRole = payload?.user_metadata?.role;

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
