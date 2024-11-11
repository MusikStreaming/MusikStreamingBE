import { z } from "zod";

const schema = z.object({
  PORT: z.coerce
    .number()
    .min(1024, "Port must be >= 1024")
    .max(65535, "Port must be <= 65535"),
  SUPABASE_URL: z
    .string({ required_error: "SUPABASE_URL is required" })
    .url("Exprected SUPABASE_URL to be url"),
  SUPABASE_KEY: z.string({ required_error: "SUPABASE_KEY is required" }),
  AWS_ENDPOINT: z
    .string({ required_error: "AWS_ENDPOINT is required" })
    .url("Expected AWS_ENDPOINT to be url"),
  AWS_REGION: z.string({ required_error: "AWS_REGION is required" }),
  AWS_ACCESS_KEY_ID: z.string({
    required_error: "AWS_ACCESS_KEY_ID is required",
  }),
  AWS_SECRET_ACCESS_KEY: z.string({
    required_error: "AWS_SECRET_ACCESS_KEY is required",
  }),
  AWS_BUCKET: z.string({ required_error: "AWS_BUCKET is required" }),
  CLOUDINARY_NAME: z.string({ required_error: "CLOUDINARY_NAME is required" }),
  CLOUDINARY_API_KEY: z.string({
    required_error: "CLOUDINARY_API_KEY is required",
  }),
  CLOUDINARY_SECRET: z.string({
    required_error: "CLOUDINARY_SECRET is required",
  }),
  CLOUDINARY_PREFIX: z
    .string({ required_error: "CLOUDINARY_PREFIX is required" })
    .url("Exprected CLOUDINARY_PREFIX to be url"),
  REDIS_URL: z
    .string({ required_error: "REDIS_URL is required" })
    .url("Exprected REDIS_URL to be url"),
  REDIS_TOKEN: z.string({ required_error: "REDIS_TOKEN is required" }),
  ZALO_APP_ID: z.string({ required_error: "ZALO_APP_ID is required" }),
  ZALO_KEY1: z.string({ required_error: "ZALO_KEY1 is required" }),
  ZALO_KEY2: z.string({ required_error: "ZALO_KEY2 is required" }),
});

export type Env = z.infer<typeof schema>;

let env: Env;
try {
  env = schema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(
      "❌ Invalid environment variables:",
      JSON.stringify(error.errors, null, 2),
    );
  } else {
    console.error("❌ Error parsing environment variables:", error);
  }
  process.exit(1);
}

export default env;
