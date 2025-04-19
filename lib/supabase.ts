import { createClient } from "@supabase/supabase-js";

// For client-side usage (with auth)
let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseClient && typeof window !== "undefined") {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase environment variables are missing");
      return null;
    }

    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error("Failed to create Supabase client:", error);
      return null;
    }
  }
  return supabaseClient;
};

// For server-side usage (without auth)
export const createSupabaseServer = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase server environment variables are missing");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};
