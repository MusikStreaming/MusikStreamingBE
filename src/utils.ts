import { JWTPayload, SanitizeOptions } from "./models/interfaces";

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

  const userRole = sanitize(payload.user_metadata.role, {
    type: "string",
    defaultValue: "Anonymous",
    allowedValues: ["Admin", "User", "Artist Manager"],
  });
  return userRole;
};

const escapeHtml = (input: string): string => {
  const entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  return String(input).replace(
    /[&<>"'`=\/]/g,
    (s) => entityMap[s as keyof typeof entityMap] || s,
  );
};

const sanitize = (value: any, options: SanitizeOptions) => {
  if (value == null || value === "") {
    return options.defaultValue;
  }

  switch (options.type) {
    case "number": {
      const num = Number(value);
      if (
        Number.isNaN(num) ||
        (options.min !== undefined && num < options.min) ||
        (options.max !== undefined && num > options.max)
      ) {
        return options.defaultValue;
      }
      return num;
    }

    case "string": {
      const str = String(value).trim();
      if (options.allowedValues && !options.allowedValues.includes(str)) {
        return options.defaultValue;
      }
      return escapeHtml(str);
    }

    case "boolean": {
      return value === "true" || value === true;
    }

    default:
      throw new Error(`Unsupported type: ${options.type}`);
  }
};

export { parseJWTPayload, enforceRole, sanitize, escapeHtml };
