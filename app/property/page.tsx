"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabase, isBackendConfigured, ownerWhatsApp } from "../../lib/supabase";
import { SAMPLE_PROPERTIES } from "../../lib/sample-data";
import { whatsappInquiryUrl, type Property } from "../../lib/types";
import BackendNotice from "../../components/BackendNotice";
import Reveal from "../../components/Reveal";

const PHONE_DISPLAY = "0321-2028654";

/** Split "Features: a, b, c." out of a description into chips + remaining text. */
function splitFeatures(description: string): { features: string[]; rest: string } {
  const m = description.match(/features\s*:/i);
  if (!m || m.index === undefined) return { features: [], rest: description };
  const before = description.slice(0, m.index).trim();
  const after = description.slice(m.index + m[0].length);
  const featMatch = after.match(/^([^.]+)\.?\s*([\s\S]*)$/);
  const featStr = featMatch ? featMatch[1] : after;
  const restAfter = featMatch ? featMatch[2].trim() : "";
  const features = featStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const rest = [before, restAfter].filter(Boolean).join(" ");
  return { features, rest };
}

// Clifton, Karachi — OpenStreetMap embed (no API key needed)
const MAP_LAT = 24.8607;
const MAP_LON = 67.0011;
const MAP_SRC = `https://www.openstreetmap.org/export/embed.html?bbox=${(
  MAP_LON - 0.02
).toFixed(4)}%2C${(MAP_LAT - 0.02).toFixed(4)}%2C${(MAP_LON + 0.02).toFixed(
  4
)}%2C${(MAP_LAT + 0.02).toFixed(4)}&layer=mapnik&marker=${MAP_LAT}%2C${MAP_LON}`;

function PropertyDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }
      const sb = getSupabase();
      if (!sb) {
        setProperty(SAMPLE_PROPERTIES.find((p) => p.id === id) ?? null);
        setLoading(false);
        return;
      }
      const { data, error } = await sb.from("properties").select("*").eq("id", id).single();
      if (!error && data) setProperty(data as Property);
      setLoading(false);
    }
    load();
  }, [id]);

  const { features, rest } = useMemo(
    () => splitFeatures(property?.description ?? ""),
    [property]
  );

  const waUrl = property && ownerWhatsApp ? whatsappInquiryUrl(property, ownerWhatsApp) : null;

  const shareText = property
    ? `Check out this property: ${property.title} — ${property.price_text} (${property.location})`
    : "Majestic Property Solutions";
  const shareWa = `https://wa.me/?text=${encodeURIComponent(
    pageUrl ? `${shareText}\n${pageUrl}` : shareText
  )}`;
  const shareFb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;

  async function copyLink() {
    if (!pageUrl) return;
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = pageUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {!isBackendConfigured && <BackendNotice />}

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
            <Link href="/">← All Properties</Link>
            {waUrl ? (
              <a className="nav-cta" href={waUrl} target="_blank" rel="noopener noreferrer">
                💬 WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </nav>

      <main className="container">
        <Link href="/" className="back-link">← Back to listings</Link>

        {loading ? (
          <div className="empty">Loading…</div>
        ) : !property ? (
          <div className="empty">
            <h3>Property not found</h3>
            <p>It may have been removed. Browse the current listings instead.</p>
          </div>
        ) : (
          <>
            <div className="detail-layout">
              <div>
                <Reveal>
                  <div className="gallery">
                    <div className="gallery-main">
                      {property.images[activeImg] && (
                        <img
                          src={property.images[activeImg]}
                          alt={property.title}
                        />
                      )}
                    </div>
                    {property.images.length > 1 && (
                      <div className="gallery-thumbs">
                        {property.images.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={`${property.title} — photo ${i + 1}`}
                            loading="lazy"
                            className={`thumb${i === activeImg ? " active" : ""}`}
                            onClick={() => setActiveImg(i)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Reveal>

                <Reveal>
                  <div className="detail-body">
                    <div>
                      {property.featured ? (
                        <span className="badge featured">★ Featured</span>
                      ) : (
                        <span className={`badge ${property.type}`}>
                          {property.type === "sale" ? "For Sale" : "For Rent"}
                        </span>
                      )}
                      {property.sample && <span className="badge sample">Sample</span>}
                    </div>
                    <h2>{property.title}</h2>
                    <div className="detail-loc">📍 {property.location}</div>

                    <div className="spec-grid">
                      {property.beds ? (
                        <div className="spec-card"><b>{property.beds}</b><span>Bedrooms</span></div>
                      ) : null}
                      {property.baths ? (
                        <div className="spec-card"><b>{property.baths}</b><span>Bathrooms</span></div>
                      ) : null}
                      {property.area_sqft ? (
                        <div className="spec-card"><b>{property.area_sqft.toLocaleString()}</b><span>Sq Ft</span></div>
                      ) : null}
                      <div className="spec-card">
                        <b>{property.type === "sale" ? "Sale" : "Rent"}</b>
                        <span>Listing Type</span>
                      </div>
                    </div>

                    {features.length > 0 && (
                      <>
                        <h3 className="detail-h3">Features & Amenities</h3>
                        <div className="feature-chips">
                          {features.map((f) => (
                            <span key={f} className="chip">✓ {f}</span>
                          ))}
                        </div>
                      </>
                    )}

                    {rest && (
                      <>
                        <h3 className="detail-h3">About This Property</h3>
                        {rest.split(/\n+/).map((para, i) => (
                          <p key={i} className="desc">{para}</p>
                        ))}
                      </>
                    )}

                    <h3 className="detail-h3">Share This Listing</h3>
                    <div className="share-row">
                      <a
                        className="share-btn share-wa"
                        href={shareWa}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        💬 WhatsApp
                      </a>
                      <a
                        className="share-btn share-fb"
                        href={shareFb}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        👍 Facebook
                      </a>
                      <button
                        type="button"
                        className={`share-btn share-copy${copied ? " done" : ""}`}
                        onClick={copyLink}
                      >
                        {copied ? "✓ Copied!" : "🔗 Copy Link"}
                      </button>
                    </div>

                    <h3 className="detail-h3">Location</h3>
                    <p className="desc" style={{ marginBottom: 12 }}>
                      📍 {property.location} — shown on the map below.
                    </p>
                    <div className="map-wrap">
                      <iframe
                        title={`Map — ${property.location}`}
                        src={MAP_SRC}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={120}>
                <aside className="inquiry-card">
                  <span className="kicker">Interested?</span>
                  <div className="inquiry-price">{property.price_text}</div>
                  <div className="sub">{property.title}</div>
                  {waUrl ? (
                    <a className="wa-btn" href={waUrl} target="_blank" rel="noopener noreferrer">
                      💬 Inquire on WhatsApp
                    </a>
                  ) : (
                    <span className="wa-btn disabled" title="Set NEXT_PUBLIC_OWNER_WHATSAPP to enable">
                      💬 Inquire on WhatsApp
                    </span>
                  )}
                  <div className="inquiry-meta">
                    Prefer to call? <b>{PHONE_DISPLAY}</b>
                    <br />
                    Majestic Property Solution&apos;s, Clifton, Karachi
                  </div>
                </aside>
              </Reveal>
            </div>
          </>
        )}
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-bottom">
            <span>© 2026 Majestic Property Solution&apos;s, Karachi. All rights reserved.</span>
            <span>Clifton · DHA · Bahria Town · DHA City</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function PropertyPage() {
  return (
    <Suspense fallback={<div className="empty">Loading…</div>}>
      <PropertyDetail />
    </Suspense>
  );
}
