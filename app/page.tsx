"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabase, isBackendConfigured, ownerWhatsApp } from "../lib/supabase";
import { SAMPLE_PROPERTIES } from "../lib/sample-data";
import type { Property } from "../lib/types";
import PropertyCard from "../components/PropertyCard";
import BackendNotice from "../components/BackendNotice";
import Reveal from "../components/Reveal";

const AREAS = [
  { name: "DHA", note: "Defence Housing Authority" },
  { name: "Clifton", note: "Sea-view apartments & villas" },
  { name: "Bahria Town", note: "Modern gated community" },
  { name: "DHA City", note: "Karachi's growing suburb" },
  { name: "Emaar", note: "Crescent Bay & beyond" },
];

const PHONE_DISPLAY = "0321-2028654";
const ADDRESS = "Shop G6, Ground Floor, Columbus Tower, Clifton, near Teen Talwar, Karachi";
const FACEBOOK_URL =
  "https://www.facebook.com/people/Majestic-Property-Solutions/100085435413790/";

function waGeneralUrl(): string | null {
  if (!ownerWhatsApp) return null;
  const text = "Salam! I am looking for a property in Karachi. Please guide me.";
  return `https://wa.me/${ownerWhatsApp}?text=${encodeURIComponent(text)}`;
}

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
    const list = properties.filter((p) => {
      if (type !== "all" && p.type !== type) return false;
      if (q && !`${p.title} ${p.location}`.toLowerCase().includes(q)) return false;
      if (max !== null && p.price_num !== null && p.price_num > max) return false;
      return true;
    });
    // Featured listings first (missing flag treated as false), then newest.
    return [...list].sort(
      (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false)
    );
  }, [properties, query, type, maxPrice]);

  const waGeneral = waGeneralUrl();

  function scrollToListings() {
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {!isBackendConfigured && <BackendNotice />}

      {/* ---------- NAV ---------- */}
      <nav className="nav">
        <div className="container nav-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">M</span>
            <span className="brand-text">
              <strong>Majestic</strong>
              <span>PROPERTY SOLUTIONS</span>
            </span>
          </Link>
          <div className="nav-links">
            <Link href="#listings">Properties</Link>
            <Link href="#areas">Areas</Link>
            <Link href="#why">Why Us</Link>
            <Link href="#contact">Contact</Link>
            {waGeneral ? (
              <a className="nav-cta" href={waGeneral} target="_blank" rel="noopener noreferrer">
                💬 WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <header className="hero">
        <div className="container">
          <div className="hero-inner">
            <span className="eyebrow">✦ Clifton · Karachi — Premium Real Estate</span>
            <h1>
              Find a Home <em>Worth</em> Coming Back To
            </h1>
            <p className="hero-sub">
              Handpicked apartments, houses and flats for sale and rent across
              Karachi&apos;s finest neighbourhoods — with direct, honest dealing.
            </p>

            <form
              className="search-panel"
              onSubmit={(e) => {
                e.preventDefault();
                scrollToListings();
              }}
            >
              <div className="search-field">
                <span className="icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by area or project…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search by area or project"
                />
              </div>
              <div className="search-field">
                <span className="icon">🏷️</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "all" | "sale" | "rent")}
                  aria-label="Listing type"
                >
                  <option value="all">Buy or Rent</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
              <div className="search-field">
                <span className="icon">💰</span>
                <select
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  aria-label="Maximum price"
                >
                  <option value="">Any price</option>
                  <option value="100000">Up to Rs 1 Lakh</option>
                  <option value="5000000">Up to Rs 50 Lakh</option>
                  <option value="10000000">Up to Rs 1 Crore</option>
                  <option value="30000000">Up to Rs 3 Crore</option>
                  <option value="100000000">Up to Rs 10 Crore</option>
                </select>
              </div>
              <button type="submit" className="search-btn">
                Search
              </button>
            </form>
            <div className="hero-note">
              {(query || type !== "all" || maxPrice) && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setType("all");
                    setMaxPrice("");
                  }}
                >
                  ✕ Clear search filters
                </button>
              )}
            </div>
          </div>

          <div className="stats-strip">
            <div className="stats-inner">
              <div className="stat">
                <b>{loading ? "…" : properties.length}</b>
                <span>Properties Listed</span>
              </div>
              <div className="stat">
                <b>5</b>
                <span>Areas Served</span>
              </div>
              <div className="stat">
                <b>Direct</b>
                <span>WhatsApp Dealing</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- LISTINGS ---------- */}
      <main className="container">
        <section id="listings" className="section">
          <Reveal>
            <div className="toolbar">
              <h2>Available Properties</h2>
              <span className="count">
                {loading
                  ? "Loading…"
                  : `${filtered.length} propert${filtered.length === 1 ? "y" : "ies"}`}
              </span>
            </div>
          </Reveal>
          {loading ? (
            <div className="empty">Loading properties…</div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <h3>No properties match your search</h3>
              <p>Try a different area, or clear the filters above.</p>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 5) * 70}>
                  <PropertyCard property={p} />
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* ---------- WHY MAJESTIC ---------- */}
        <section id="why" className="section why" style={{ margin: "0 -20px", paddingLeft: 20, paddingRight: 20 }}>
          <Reveal>
            <div className="section-head">
              <span className="kicker">Why Majestic</span>
              <h2>Property Dealing, Done Properly</h2>
              <p>
                A Clifton-based agency focused on Karachi&apos;s prime
                neighbourhoods — straightforward advice, real photos, direct contact.
              </p>
            </div>
          </Reveal>
          <div className="why-grid">
            {[
              {
                icon: "📍",
                title: "Local Expertise",
                text: "Deep focus on Clifton, DHA, Bahria Town and DHA City — we know these streets, blocks and buildings.",
              },
              {
                icon: "💬",
                title: "Direct WhatsApp Dealing",
                text: "No middlemen and no waiting. Message us directly and get answers about any listing within hours.",
              },
              {
                icon: "📸",
                title: "Real Photos, Honest Details",
                text: "Every listing carries actual photographs and clear pricing — what you see is what you visit.",
              },
              {
                icon: "🤝",
                title: "Buy, Sell & Rent",
                text: "From family apartments to investment plots, we handle sales and rentals across Karachi's key areas.",
              },
            ].map((w, i) => (
              <Reveal key={w.title} delay={i * 80}>
                <div className="why-card">
                  <div className="why-icon">{w.icon}</div>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- AREAS ---------- */}
        <section id="areas" className="section">
          <Reveal>
            <div className="section-head">
              <span className="kicker">Areas Served</span>
              <h2>Where We Operate</h2>
              <p>Focused coverage across Karachi&apos;s most sought-after addresses.</p>
            </div>
          </Reveal>
          <div className="areas-grid">
            {AREAS.map((a, i) => (
              <Reveal key={a.name} delay={i * 60}>
                <div className="area-card">
                  <h3>{a.name}</h3>
                  <span>{a.note}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="section" style={{ paddingTop: 0 }} id="contact">
          <Reveal>
            <div className="cta-banner">
              <h2>
                Looking to <em>buy</em>, <em>sell</em> or <em>rent</em>?
              </h2>
              <p>
                Tell us what you need on WhatsApp — a real person replies, usually
                within the hour. Visit us at {ADDRESS}.
              </p>
              <div className="cta-actions">
                {waGeneral ? (
                  <a className="wa-btn" href={waGeneral} target="_blank" rel="noopener noreferrer">
                    💬 Chat on WhatsApp
                  </a>
                ) : null}
                <a className="btn-outline" href={`tel:${PHONE_DISPLAY.replace(/-/g, "")}`}>
                  📞 {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <strong>Majestic</strong>
              <span>PROPERTY SOLUTIONS</span>
              <p>
                Premium real estate services in Clifton, Karachi — apartments,
                houses and flats for sale and rent.
              </p>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <p>📍 {ADDRESS}</p>
              <a href={`tel:${PHONE_DISPLAY.replace(/-/g, "")}`}>📞 {PHONE_DISPLAY}</a>
              {waGeneral && (
                <a href={waGeneral} target="_blank" rel="noopener noreferrer">
                  💬 WhatsApp Us
                </a>
              )}
            </div>
            <div className="footer-col">
              <h4>Follow</h4>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
                👍 Facebook Page
              </a>
              <Link href="#listings">🏠 Browse Properties</Link>
              <Link href="/admin">🔐 Admin Login</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Majestic Property Solution&apos;s, Karachi. All rights reserved.</span>
            <span>Clifton · DHA · Bahria Town · DHA City</span>
          </div>
        </div>
      </footer>
    </>
  );
}
