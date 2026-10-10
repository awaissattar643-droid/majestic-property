import Link from "next/link";
import { formatSpecs, whatsappInquiryUrl, type Property } from "../lib/types";
import { ownerWhatsApp } from "../lib/supabase";

export default function PropertyCard({ property }: { property: Property }) {
  const img = property.images[0];
  const waUrl = ownerWhatsApp ? whatsappInquiryUrl(property, ownerWhatsApp) : null;
  const detailHref = `/property?id=${property.id}`;

  const badges = (
    <>
      {property.featured ? (
        <span className="badge featured">★ Featured</span>
      ) : (
        <span className={`badge ${property.type}`}>
          {property.type === "sale" ? "For Sale" : "For Rent"}
        </span>
      )}
      {property.sample && <span className="badge sample">Sample</span>}
    </>
  );

  return (
    <div className="card">
      {img ? (
        <Link href={detailHref} className="card-media" aria-label={property.title}>
          <img className="card-img" src={img} alt={property.title} loading="lazy" />
          <span className="card-badges">{badges}</span>
          <span className="card-price">{property.price_text}</span>
        </Link>
      ) : (
        <div className="card-media card-media-empty">
          <span className="card-badges">{badges}</span>
        </div>
      )}
      <div className="card-body">
        <h3>
          <Link href={detailHref}>{property.title}</Link>
        </h3>
        <div className="loc">
          <span aria-hidden="true">📍</span> {property.location}
        </div>
        {!img && <div className="price">{property.price_text}</div>}
        <div className="spec-row">
          {property.beds ? (
            <span>
              🛏️ <b>{property.beds}</b> Beds
            </span>
          ) : null}
          {property.baths ? (
            <span>
              🛁 <b>{property.baths}</b> Baths
            </span>
          ) : null}
          {property.area_sqft ? (
            <span>
              📐 <b>{property.area_sqft.toLocaleString()}</b> sqft
            </span>
          ) : null}
          {!property.beds && !property.baths && !property.area_sqft && (
            <span>{formatSpecs(property)}</span>
          )}
        </div>
        {waUrl ? (
          <a className="wa-btn" href={waUrl} target="_blank" rel="noopener noreferrer">
            💬 WhatsApp Inquiry
          </a>
        ) : (
          <span className="wa-btn disabled" title="Set NEXT_PUBLIC_OWNER_WHATSAPP to enable">
            💬 WhatsApp Inquiry
          </span>
        )}
      </div>
    </div>
  );
}
