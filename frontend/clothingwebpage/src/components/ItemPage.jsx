import React, { useCallback, useEffect, useMemo, useState } from "react";
import API from "../api.js";
import ReviewForm from "./ReviewForm.jsx";

function normalizeReview(raw = {}) {
  const ratingNum = Number.parseFloat(raw.rating ?? raw.Rating);
  return {
    title: raw.Title ?? raw.title ?? "Anonymous",
    text:
      raw["Review Text"] ??
      raw.review_text ??
      raw.reviewText ??
      "No review text provided",
    rating: Number.isFinite(ratingNum) ? ratingNum : null,
    recommended:
      raw.recommended === 1 ||
      raw.recommended === "1" ||
      raw.recommended === true,
  };
}

function normalizeItem(incoming) {
  if (!incoming || typeof incoming !== "object") return null;
  let reviewsData = incoming.reviews;
  if (typeof reviewsData === "string") {
    try {
      reviewsData = JSON.parse(reviewsData);
    } catch {
      reviewsData = [];
    }
  }
  if (!Array.isArray(reviewsData)) reviewsData = [];
  const reviews = reviewsData.map(normalizeReview);

  return {
    ...incoming,
    title: incoming.title ?? incoming.item_name ?? "Untitled",
    short_description: incoming.short_description ?? incoming.subtitle ?? "",
    image: incoming.image || "/placeholder.png",
    reviews,
  };
}

export default function ItemPage({ itemId, onBack }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get(`/item/${itemId}`);
      const normalized = normalizeItem(res.data);
      setItem(normalized);
    } catch {
      setError("Failed to load item details");
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const reviews = useMemo(() => item?.reviews ?? [], [item]);
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : "—";

  const renderStars = (rating) => {
    if (!rating) return "—";
    const rounded = Math.round(rating);
    return "⭐".repeat(rounded) + "☆".repeat(5 - rounded);
  };

  if (error) return <div className="status">{error}</div>;
  if (loading || !item) return <div className="status">Loading item details…</div>;

  return (
    <div className="item-page">
      <button className="back" onClick={onBack}>
        ← Back to Items
      </button>

      <div className="item-hero">
        <img
          src={item.image || "/placeholder.png"}
          alt={item.title}
          onError={(e) => (e.target.src = "/placeholder.png")}
        />
        <div>
          <h2>{item.title}</h2>
          <p className="muted">{item.short_description}</p>
          <div className="meta">
            {item.class_name} · {item.department} · {item.division}
          </div>
          <div className="avg-rating">
            ⭐ Average Rating: <strong>{avgRating}</strong> / 5
          </div>
        </div>
      </div>

      <div className="review-section">
        <aside className="review-form-side">
          <ReviewForm itemId={itemId} onPosted={fetchItem} />
        </aside>

        <section className="reviews">
          <h3>Customer Reviews</h3>
          <div className="review-list">
            {reviews.length === 0 ? (
              <p className="muted">No reviews yet.</p>
            ) : (
              reviews.map((r, i) => (
                <div key={i} className="review">
                  <strong>{r.title}</strong>
                  <div className="rating">
                    {renderStars(r.rating)} ({r.rating ?? "—"})
                  </div>
                  <p>{r.text}</p>
                  <div className="recommended">
                    Recommended: {r.recommended ? "✅ Yes" : "❌ No"}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
