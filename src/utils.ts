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
  // This is a utility func to control cache
  // Admins will have real-time data => no cache
  // Others will have cache
  // Q: What if JWT payload were modified to have role as Admin?
  // A: Well they will not have cache, and db wont accept them anyway because of invalid signature
  // This only applies to (which contains private data):
  // - Collections
  // - Users
  let role = "Anonymous";
  if (header) {
    const parts = header.split(".");
    if (parts.length === 3) {
      const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
      const {
        user_metadata: { role: userRole },
      } = JSON.parse(decoded);

      if (userRole) {
        role = userRole;
      }
    }
  }
  return role;
};

export default {
  parseJWTPayload,
  enforceRole,
};
