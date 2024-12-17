import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/models";
import env from "@/env";

/**
 * Supabase client for public access
 */
export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: "pkce",
    },
  },
);

/**
 * Supabase client for protected access
 */
export const supabasePro = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      flowType: "pkce",
    },
  },
);
