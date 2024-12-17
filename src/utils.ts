import { JWTPayload, SanitizeOptions } from "@/types/interfaces";

/**
 * Parse JWT payload from the Authorization header
 * @param header Authorization header
 * @returns JWTPayload or error message
 * @example
 * const [payload, status] = parseJWTPayload(req.headers.authorization);
 * if ("error" in payload) {
 *  res.status(status).json({ error: payload.error });
 *  return;
 *  }
 */
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

const entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
} as const;

/**
 * Escape HTML entities
 * @param input Input string
 * @returns Escaped string
 * @example
 * const escaped = escapeHtml("<script>alert('XSS')</script>");
 * console.log(escaped); // &lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;
 */
const escapeHtml = (input: string): string => {
  return String(input).replace(
    /[&<>"'`=\/]/g,
    (s) => entityMap[s as keyof typeof entityMap] || s,
  );
};

/**
 * Sanitize input value
 * @param value Input value
 * @param options Sanitize options
 * @returns Sanitized value
 * @example
 * const sanitized = sanitize(req.query.page, {
 *  type: "number",
 *  defaultValue: 10,
 *  min: 10,
 *  max: 50,
 * });
 */
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
      return value === "true" || value === true ? true : options.defaultValue;
    }

    default:
      throw new Error(`Unsupported type: ${options.type}`);
  }
};

export { parseJWTPayload, sanitize, escapeHtml };
