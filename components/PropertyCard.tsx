import Link from "next/link";
import { formatSpecs, whatsappInquiryUrl, type Property } from "../lib/types";
import { ownerWhatsApp } from "../lib/supabase";

export default function PropertyCard({ property }: { property: Property }) {
  const img = property.images[0];
  const waUrl = ownerWhatsApp
    ? whatsappInquiryUrl(property, ownerWhatsApp)
    : null;

  return (
    <div className="card">
      {img && (
        <Link href={`/property?id=${property.id}`}>
          <img className="card-img" src={img} alt={property.title} loading="lazy" />
        </Link>
      )}
      <div className="card-body">
        <div>
          <span className={`badge ${property.type}`}>
            {property.type === "sale" ? "FOR SALE" : "FOR RENT"}
          </span>
          {property.sample && <span className="badge sample">SAMPLE</span>}
        </div>
        <h3>
          <Link href={`/property?id=${property.id}`}>{property.title}</Link>
        </h3>
        <div className="loc">📍 {property.location}</div>
        <div className="price">{property.price_text}</div>
        <div className="meta">{formatSpecs(property)}</div>
        {waUrl ? (
          <a className="wa-btn" href={waUrl} target="_blank" rel="noopener noreferrer">
            💬 WhatsApp
          </a>
        ) : (
          <span className="wa-btn disabled" title="Set NEXT_PUBLIC_OWNER_WHATSAPP to enable">
            💬 WhatsApp
          </span>
        )}
      </div>
    </div>
  );
}
