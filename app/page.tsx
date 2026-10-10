"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase, isBackendConfigured } from "../lib/supabase";
import { SAMPLE_PROPERTIES } from "../lib/sample-data";
import type { Property } from "../lib/types";
import PropertyCard from "../components/PropertyCard";
import BackendNotice from "../components/BackendNotice";

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "sale" | "rent">("all");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    async function load() {
      const sb = getSupabase();
      if (!sb) {
        setProperties(SAMPLE_PROPERTIES);
        setLoading(false);
        return;
      }
      const { data, error } = await sb
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setProperties(data as Property[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const max = maxPrice ? Number(maxPrice) : null;
    return properties.filter((p) => {
      if (type !== "all" && p.type !== type) return false;
      if (q && !`${p.title} ${p.location}`.toLowerCase().includes(q)) return false;
      if (max !== null && p.price_num !== null && p.price_num > max) return false;
      return true;
    });
  }, [properties, query, type, maxPrice]);

  return (
    <>
      {!isBackendConfigured && <BackendNotice />}
      <header className="site-header">
        <div className="container">
          <h1>🏢 Majestic Property Solutions</h1>
          <p>Houses, apartments &amp; flats for sale and rent — Clifton, Karachi</p>
        </div>
      </header>

      <main className="container">
        <div className="toolbar">
          <h2>Available Properties</h2>
          <span className="count">
            {loading ? "Loading…" : `${filtered.length} propert${filtered.length === 1 ? "y" : "ies"}`}
          </span>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search by title or location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select value={type} onChange={(e) => setType(e.target.value as "all" | "sale" | "rent")}>
            <option value="all">All types</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          >
            <option value="">Any price</option>
            <option value="100000">Up to Rs 1 Lakh</option>
            <option value="5000000">Up to Rs 50 Lakh</option>
            <option value="10000000">Up to Rs 1 Crore</option>
            <option value="30000000">Up to Rs 3 Crore</option>
            <option value="100000000">Up to Rs 10 Crore</option>
          </select>
          <button
            className="btn btn-gray"
            onClick={() => { setQuery(""); setType("all"); setMaxPrice(""); }}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="empty">Loading properties…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            No properties match your search. Try clearing the filters.
          </div>
        ) : (
          <div className="grid">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </main>

      <footer className="site-footer">
        Majestic Property Solutions — Clifton, Karachi
      </footer>
    </>
  );
}
