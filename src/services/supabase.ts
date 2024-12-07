import { createClient } from "@supabase/supabase-js";
import { Database } from "@/models/types";
import env from "@/env";

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: "pkce",
    },
  },
);

export const supabasePro = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      flowType: "pkce",
    },
  },
);
