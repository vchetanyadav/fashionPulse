import React, { useEffect, useState } from "react";
import ProductGrid from "./components/ProductGrid.jsx";
import ItemPage from "./components/ItemPage.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import API from "./api.js";

export default function App() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [topRated, setTopRated] = useState([]);
  const [recent, setRecent] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [topReviewed, setTopReviewed] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await API.get("/items");
      setItems(res.data.items || []);
      setDepartments([...new Set(res.data.items.map((i) => i.department))]);
    })();
    (async () => {
      const top = await API.get("/top-rated");
      const topRev = await API.get("/top-reviewed");
      const rec = await API.get("/recent-reviews");
      setTopRated(top.data.items || []);
      setTopReviewed(topRev.data.items || []);
      setRecent(rec.data.items || []);
    })();
  }, []);

  const handleSearch = async (q) => {
    if (!q.trim()) return;
    const res = await API.get("/search", { params: { q } });
    setItems(res.data.items || []);
    setMessage(res.data.message || "");
  };

  const handleCategory = async (dept) => {
    const res = await API.get(`/category/${dept}`);
    setItems(res.data.items || []);
    setMessage(`Category: ${dept}`);
  };

  return (
    <div className="app-root">
      <Navbar />
      <header className="hero">
        <h1>FashionPulse</h1>
        <p>Discover styles, read reviews, and get AI-based recommendations.</p>
        <SearchBar onSearch={handleSearch} />
        <div className="status">{message}</div>
      </header>

      {!selected ? (
        <>
          <CategoryBar departments={departments} onSelect={handleCategory} />
          <TopRatedCarousel items={topRated} onOpen={setSelected} />
          <TopReviewedCarousel items={topReviewed} onOpen={setSelected} />
          <RecentReviews reviews={recent} />
          <ProductGrid items={items} onOpen={setSelected} />
        </>
      ) : (
        <ItemPage itemId={selected} onBack={() => setSelected(null)} />
      )}
      <Footer />
    </div>
  );
}

function SearchBar({ onSearch }) {
  const [q, setQ] = useState("");

  // Debounce search by 500ms
  useEffect(() => {
    if (!q.trim()) return;
    const delay = setTimeout(() => {
      onSearch(q);
    }, 500);
    return () => clearTimeout(delay);
  }, [q]);

  return (
    <div className="search-row">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search dresses, tops..."
      />
      <button onClick={() => onSearch(q)}>Search</button>
    </div>
  );
}


function CategoryBar({ departments, onSelect }) {
  return (
    <div className="category-bar">
      {departments.map((d, i) => (
        <button key={i} onClick={() => onSelect(d)}>{d}</button>
      ))}
    </div>
  );
}

function TopRatedCarousel({ items, onOpen }) {
  if (!items.length) return null;
  return (
    <div className="carousel">
      <h3>⭐ Top Rated Items</h3>
      <div className="carousel-row">
        {items.map((i) => (
          <div key={i.item_id} className="carousel-item" onClick={() => onOpen(i.item_id)}>
            <img src={i.image || "/placeholder.png"} alt={i.title} />
            <p>{i.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopReviewedCarousel({ items, onOpen }) {
  if (!items.length) return null;
  return (
    <div className="carousel">
      <h3>🔥 Most Reviewed Items</h3>
      <div className="carousel-row">
        {items.map((i) => (
          <div
            key={i.item_id}
            className="carousel-item"
            onClick={() => onOpen(i.item_id)}
          >
            <img src={i.image || "/placeholder.png"} alt={i.title} />
            <p>{i.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


function RecentReviews({ reviews }) {
  if (!reviews.length) return null;
  return (
    <div className="recent-reviews">
      <h3>🕒 Recent Reviews</h3>
      <ul>
        {reviews.map((r, i) => (
          <li key={i}>
            <strong>{r.title}</strong>: {r.review_text.slice(0, 80)}...
          </li>
        ))}
      </ul>
    </div>
  );
}
