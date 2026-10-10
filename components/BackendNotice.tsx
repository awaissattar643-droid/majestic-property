/**
 * Honest banner shown when Supabase env vars are missing.
 * Mirrors the SwiftPOS "Backend not connected" pattern: the app still
 * runs, but on clearly-labeled sample data.
 */
export default function BackendNotice() {
  return (
    <div className="backend-notice">
      <strong>⚠️ Backend not connected.</strong> Showing sample listings.
      Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
      <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code> to go live.
    </div>
  );
}
