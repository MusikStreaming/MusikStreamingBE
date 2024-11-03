const parseJWTPayload = (header: string | undefined) => {
  if (!header) {
    return [{ error: "Unauthorized" }, 401];
  }

  const parts = header.split(".");
  if (parts.length !== 3) {
    throw [{ error: "Invalid token input" }, 500];
  }

  const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
  return [JSON.parse(decoded), 200];
};
