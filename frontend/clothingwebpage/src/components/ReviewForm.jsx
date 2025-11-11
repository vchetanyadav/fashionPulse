import React, { useState } from "react";
import API from "../api.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ReviewForm({ itemId, onPosted }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [pred, setPred] = useState(null);
  const [conf, setConf] = useState(null);
  const [override, setOverride] = useState("");
  const [status, setStatus] = useState("");

  // --- Step 1: Get model prediction ---
  const checkPrediction = async () => {
    if (!text.trim()) {
      setStatus("Please enter review text first.");
      return;
    }
    setStatus("Predicting...");
    try {
      const res = await API.post("/review", {
        item_id: itemId,
        title,
        review_text: text,
        rating,
        override: null,
      });
      setPred(res.data.predicted);
      setConf(res.data.confidence);
      setStatus(
        `Model predicted: ${res.data.predicted === 1 ? "Recommend" : "Do not recommend"
        } (Confidence: ${res.data.confidence}%). You may override or confirm.`
      );
      toast.info(
        `AI suggests: ${res.data.predicted === 1 ? "Recommend ✅" : "Not Recommended ❌"} (${res.data.confidence}%)`
      );
    } catch {
      setStatus("Prediction failed. Try again.");
      toast.error("Prediction failed. Try again.");
    }
  };

  // --- Step 2: Confirm & Submit ---
  const submit = async () => {
    setStatus("Submitting...");
    try {
      const over = override === "" ? null : parseInt(override, 10);
      const res = await API.post("/review", {
        item_id: itemId,
        title,
        review_text: text,
        rating,
        override: over,
      });
      toast.success("✅ Review saved successfully!");
      setStatus("✅ Review saved successfully.");
      setTitle("");
      setText("");
      setRating(5);
      setPred(null);
      setConf(null);
      setOverride("");
      if (onPosted) await onPosted(); // refresh reviews
    } catch {
      setStatus("❌ Submit failed. Please retry.");
      toast.error("Submit failed. Please retry.");
    }
  };

  return (
    <div className="review-form">
      <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar theme="colored" />
      <h3>Add a Review</h3>

      <div className="form-group">
        <label>Review Title</label>
        <input
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Review Text</label>
        <textarea
          placeholder="Write your review..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button type="button" onClick={checkPrediction}>
          Get Model Suggestion
        </button>
      </div>

      {pred !== null && (
        <div className="prediction">
          <p>
            <strong>Model suggests:</strong>{" "}
            {pred === 1 ? "Recommend (1)" : "Do not recommend (0)"}{" "}
            <span style={{ color: "#555" }}>
              — Confidence: {conf ?? "—"}%
            </span>
          </p>
          <label>Override Recommendation</label>
          <select
            value={override}
            onChange={(e) => setOverride(e.target.value)}
          >
            <option value="">Keep model suggestion</option>
            <option value="1">Recommend (1)</option>
            <option value="0">Do not recommend (0)</option>
          </select>
        </div>
      )}

      <div className="actions">
        <button type="button" onClick={submit}>
          Confirm & Submit
        </button>
      </div>

      {status && <div className="status">{status}</div>}
    </div>
  );
}
