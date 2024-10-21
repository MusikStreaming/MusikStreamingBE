import { createClient } from "@supabase/supabase-js";
import { Database } from "models/types";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
);

export default supabase;
