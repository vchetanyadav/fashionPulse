import React from "react";

export default function ProductCard({ item, onOpen }) {
  // Always show placeholder on homepage
  const imageUrl = "/placeholder.png";

  return (
    <div
      className="card"
      onClick={() => onOpen(item.item_id)}
      style={{ cursor: "pointer" }}
    >
      <div
        className="card-media"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0), rgba(0,0,0,0.15)), url(${imageUrl})`,
        }}
      />
      <div className="card-body">
        <h3>{item.title}</h3>
        <p className="muted">{item.short_description}</p>
        <div className="meta">
          {item.class_name} · {item.department}
        </div>
      </div>
    </div>
  );
}
