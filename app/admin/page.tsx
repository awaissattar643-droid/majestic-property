"use client";

export const runtime = "edge";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase, isBackendConfigured } from "../../lib/supabase";
import type { Property, PropertyType } from "../../lib/types";
import BackendNotice from "../../components/BackendNotice";

type FormState = {
  title: string;
  location: string;
  price_text: string;
  price_num: string;
  type: PropertyType;
  beds: string;
  baths: string;
  area_sqft: string;
  description: string;
  imageUrl: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  location: "",
  price_text: "",
  price_num: "",
  type: "sale",
  beds: "",
  baths: "",
  area_sqft: "",
  description: "",
  imageUrl: "",
};

export default function AdminPage() {
  const [session, setSession] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const sb = getSupabase();

  useEffect(() => {
    async function check() {
      if (!sb) return;
      const { data } = await sb.auth.getSession();
      setSession(Boolean(data.session));
      if (data.session) loadProperties();
    }
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProperties() {
    if (!sb) return;
    const { data } = await sb.from("properties").select("*").order("created_at", { ascending: false });
    if (data) setProperties(data as Property[]);
  }

  async function doLogin() {
    setLoginError("");
    if (!sb) return;
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      return;
    }
    setSession(true);
    loadProperties();
  }

  async function doLogout() {
    if (sb) await sb.auth.signOut();
    setSession(false);
    setProperties([]);
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadImage(file: File): Promise<string | null> {
    if (!sb) return null;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await sb.storage.from("property-images").upload(path, file);
      if (error) throw error;
      const { data } = sb.storage.from("property-images").getPublicUrl(path);
      return data.publicUrl;
    } catch (e) {
      setMsg(`Upload failed: ${e instanceof Error ? e.message : "unknown error"}`);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function saveProperty() {
    setMsg("");
    if (!sb) return;
    if (!form.title.trim() || !form.location.trim() || !form.price_text.trim()) {
      setMsg("Please fill Title, Location and Price.");
      return;
    }
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    const payload = {
      title: form.title.trim(),
      location: form.location.trim(),
      price_text: form.price_text.trim(),
      price_num: num(form.price_num),
      type: form.type,
      beds: num(form.beds),
      baths: num(form.baths),
      area_sqft: num(form.area_sqft),
      description: form.description.trim(),
      images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
    };

    if (editingId) {
      const { error } = await sb.from("properties").update(payload).eq("id", editingId);
      if (error) { setMsg(`Save failed: ${error.message}`); return; }
      setMsg("✅ Property updated.");
    } else {
      const { error } = await sb.from("properties").insert(payload);
      if (error) { setMsg(`Save failed: ${error.message}`); return; }
      setMsg("✅ Property added — it is now live on the website.");
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    loadProperties();
  }

  function startEdit(p: Property) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      location: p.location,
      price_text: p.price_text,
      price_num: p.price_num?.toString() ?? "",
      type: p.type,
      beds: p.beds?.toString() ?? "",
      baths: p.baths?.toString() ?? "",
      area_sqft: p.area_sqft?.toString() ?? "",
      description: p.description ?? "",
      imageUrl: p.images[0] ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProperty(id: string) {
    if (!sb) return;
    if (!confirm("Delete this property? This cannot be undone.")) return;
    const { error } = await sb.from("properties").delete().eq("id", id);
    if (error) { setMsg(`Delete failed: ${error.message}`); return; }
    setMsg("Property deleted.");
    loadProperties();
  }

  if (!isBackendConfigured) {
    return (
      <>
        <BackendNotice />
        <div className="admin-wrap">
          <div className="login-box">
            <h2>🔧 Admin Panel</h2>
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>
              Connect Supabase first — then log in with your admin email and password.
            </p>
            <Link href="/" className="back-link">← Back to site</Link>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <div className="admin-wrap">
        <div className="login-box">
          <h2>🔐 Admin Login</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>Manage your property listings</p>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doLogin()}
          />
          <button className="btn" onClick={doLogin}>Login</button>
          {loginError && <div className="error">{loginError}</div>}
          <div className="hint">
            Use the admin user created in Supabase Dashboard → Authentication → Users.
          </div>
          <Link href="/" className="back-link">← Back to site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2>{editingId ? "✏️ Edit Property" : "➕ Add Property"}</h2>
        <div>
          <Link href="/" className="btn btn-gray btn-sm" style={{ textDecoration: "none", marginRight: 8 }}>
            View site
          </Link>
          <button className="btn btn-gray btn-sm" onClick={doLogout}>Logout</button>
        </div>
      </div>

      {msg && <div className="hint" style={{ marginTop: 12 }}>{msg}</div>}

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="form-grid">
          <div className="field"><label>Title *</label><input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. 3 Bed Apartment, DHA Phase 5" /></div>
          <div className="field"><label>Location *</label><input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Clifton Block 4, Karachi" /></div>
          <div className="field"><label>Price (display) *</label><input value={form.price_text} onChange={(e) => set("price_text", e.target.value)} placeholder="e.g. Rs 2.8 Crore" /></div>
          <div className="field"><label>Price numeric (PKR, for filters)</label><input type="number" value={form.price_num} onChange={(e) => set("price_num", e.target.value)} placeholder="e.g. 28000000" /></div>
          <div className="field"><label>Type</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value as PropertyType)}>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div className="field"><label>Photo</label>
            <input type="file" accept="image/*" disabled={uploading}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await uploadImage(f);
                if (url) set("imageUrl", url);
                e.target.value = "";
              }} />
            <input style={{ marginTop: 8 }} value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="…or paste an image URL" />
            {uploading && <div className="hint">Uploading…</div>}
          </div>
          <div className="field"><label>Bedrooms</label><input type="number" value={form.beds} onChange={(e) => set("beds", e.target.value)} /></div>
          <div className="field"><label>Bathrooms</label><input type="number" value={form.baths} onChange={(e) => set("baths", e.target.value)} /></div>
          <div className="field"><label>Area (sqft)</label><input type="number" value={form.area_sqft} onChange={(e) => set("area_sqft", e.target.value)} /></div>
          <div className="field"><label>&nbsp;</label><div style={{ color: "#94a3b8", fontSize: 13 }}>Live preview below after save</div></div>
          <div className="field full"><label>Description</label><textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Short description of the property…" /></div>
          <div className="full">
            <button className="btn" onClick={saveProperty} disabled={uploading}>
              {editingId ? "Save Changes" : "Add Property"}
            </button>
            {editingId && (
              <button className="btn btn-gray" style={{ marginLeft: 8 }} onClick={() => { setForm(EMPTY_FORM); setEditingId(null); }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <h2 style={{ margin: "18px 0 6px" }}>📋 All Properties ({properties.length})</h2>
      {properties.length === 0 ? (
        <div className="empty">No properties yet — add your first one above.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="props">
            <thead><tr><th>Photo</th><th>Title</th><th>Price</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id}>
                  <td>{p.images[0] ? <img className="tbl-img" src={p.images[0]} alt="" loading="lazy" /> : "—"}</td>
                  <td><b>{p.title}</b><br /><span style={{ color: "#64748b", fontSize: 12 }}>{p.location}</span></td>
                  <td>{p.price_text}</td>
                  <td><span className={`badge ${p.type}`}>{p.type}</span></td>
                  <td className="row-actions">
                    <button className="btn btn-sm" style={{ background: "#dbeafe", color: "#1d4ed8" }} onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn btn-red btn-sm" onClick={() => deleteProperty(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
