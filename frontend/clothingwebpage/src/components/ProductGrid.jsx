import React from 'react';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ items, onOpen }) {
  // ✅ Handle empty or undefined items array gracefully
  if (!items || items.length === 0) {
    return (
      <p
        className="muted"
        style={{
          textAlign: 'center',
          marginTop: '40px',
          fontSize: '1rem',
          color: '#666',
        }}
      >
        No matching items found.
      </p>
    );
  }

  return (
    <div className="grid-root">
      {items.map((item) => (
        <ProductCard key={item.item_id} item={item} onOpen={onOpen} />
      ))}
    </div>
  );
}
