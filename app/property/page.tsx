"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabase, isBackendConfigured, ownerWhatsApp } from "../../lib/supabase";
import { SAMPLE_PROPERTIES } from "../../lib/sample-data";
import { formatSpecs, whatsappInquiryUrl, type Property } from "../../lib/types";
import BackendNotice from "../../components/BackendNotice";

function PropertyDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const waUrl =
    property && ownerWhatsApp ? whatsappInquiryUrl(property, ownerWhatsApp) : null;

  return (
    <>
      {!isBackendConfigured && <BackendNotice />}
      <header className="site-header">
        <div className="container">
          <h1>
            <Link href="/" style={{ textDecoration: "none" }}>🏢 Majestic Property Solutions</Link>
          </h1>
        </div>
      </header>

      <main className="container">
        <Link href="/" className="back-link">← Back to listings</Link>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : !property ? (
          <div className="empty">Property not found.</div>
        ) : (
          <div className="detail">
            {property.images[0] && (
              <img className="detail-img" src={property.images[0]} alt={property.title} />
            )}
            <div className="detail-body">
              <div>
                <span className={`badge ${property.type}`}>
                  {property.type === "sale" ? "FOR SALE" : "FOR RENT"}
                </span>
                {property.sample && <span className="badge sample">SAMPLE</span>}
              </div>
              <h2>{property.title}</h2>
              <div className="loc">📍 {property.location}</div>
              <div className="detail-price">{property.price_text}</div>
              <div className="specs">
                {property.beds ? (<span><b>{property.beds}</b> Bedrooms</span>) : null}
                {property.baths ? (<span><b>{property.baths}</b> Bathrooms</span>) : null}
                {property.area_sqft ? (<span><b>{property.area_sqft.toLocaleString()}</b> sqft</span>) : null}
                {!property.beds && !property.baths && !property.area_sqft && (
                  <span>{formatSpecs(property)}</span>
                )}
              </div>
              {property.description && <p className="desc">{property.description}</p>}
              {waUrl ? (
                <a className="wa-btn" href={waUrl} target="_blank" rel="noopener noreferrer" style={{ maxWidth: 320 }}>
                  💬 WhatsApp
                </a>
              ) : (
                <span className="wa-btn disabled" style={{ maxWidth: 320 }} title="Set NEXT_PUBLIC_OWNER_WHATSAPP to enable">
                  💬 WhatsApp
                </span>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="site-footer">
        Majestic Property Solutions — Clifton, Karachi
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
