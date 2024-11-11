import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().min(0).max(65535),
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string(),
  AWS_ENDPOINT: z.string().url(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_BUCKET: z.string(),
  CLOUDINARY_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_SECRET: z.string(),
  CLOUDINARY_PREFIX: z.string().url(),
  REDIS_URL: z.string().url(),
  REDIS_TOKEN: z.string(),
  ZALO_APP_ID: z.string(),
  ZALO_KEY1: z.string(),
  ZALO_KEY2: z.string(),
});

const env = schema.parse(process.env);

export default env;
