import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isBackendConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/**
 * Returns the Supabase client, or null when env vars are not set.
 * The UI must handle null by showing sample data + a "Backend not connected" notice.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isBackendConfigured) return null;
  if (!client) client = createClient(url!, anonKey!);
  return client;
}

export const ownerWhatsApp: string =
  process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "";
