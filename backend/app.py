from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import pandas as pd, numpy as np, os, joblib, math
from utils import normalize_search_query, generate_item_preview

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "C:\\Users\\CHETAN\\Documents\\Advanced Programming\\Assignment\\Assignment 3, Milstone 2\\data_milestone_II\\assignment3_II.csv")
REVIEWS_ADDED = os.path.join(BASE_DIR, "reviews_added.csv")

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
CORS(app)

# === Load Data ===
df = pd.read_csv(DATA_PATH, encoding="utf-8")
df.columns = df.columns.str.strip()
items = df.drop_duplicates(subset=["Clothes Title"]).reset_index(drop=True)
items["item_id"] = items.index.astype(int)

# === Model Wrapper ===
class ModelWrapper:
    def __init__(self):
        self.vectorizer = joblib.load(os.path.join(BASE_DIR, "count_vectorizer.pkl"))
        self.model = joblib.load(os.path.join(BASE_DIR, "logistic_regression_model.pkl"))

    def predict_with_conf(self, text):
        if not text or not isinstance(text, str):
            return 0, 0.0
        X = self.vectorizer.transform([text])
        proba = self.model.predict_proba(X)[0][1]
        pred = int(self.model.predict(X)[0])
        return pred, round(float(proba) * 100, 2)

model = ModelWrapper()

# === Load or init added reviews ===
if os.path.exists(REVIEWS_ADDED):
    reviews_added = pd.read_csv(REVIEWS_ADDED)
    reviews_added.columns = reviews_added.columns.str.strip()
    reviews_added["item_id"] = reviews_added["item_id"].astype(int)
else:
    reviews_added = pd.DataFrame(columns=["item_id","title","review_text","rating","predicted_recommend","final_recommend"])

# === Helper: sanitize invalid JSON ===
def safe_json(obj):
    if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    if isinstance(obj, dict): return {k: safe_json(v) for k,v in obj.items()}
    if isinstance(obj, list): return [safe_json(v) for v in obj]
    return obj

# === Helper: get best image for item ===
def get_image_for_item(item_id, title=None):
    folder = os.path.join(BASE_DIR, "static_images")

    # Try by item_id
    for ext in ["jpg", "jpeg", "png"]:
        path = os.path.join(folder, f"item_{item_id}.{ext}")
        if os.path.exists(path):
            return f"/static_images/item_{item_id}.{ext}"

    # Try by cleaned title (e.g., "red_dress.png")
    if title:
        safe_title = (
            str(title)
            .lower()
            .replace(" ", "_")
            .replace("/", "_")
            .replace("\\", "_")
        )
        for ext in ["jpg", "jpeg", "png"]:
            path = os.path.join(folder, f"{safe_title}.{ext}")
            if os.path.exists(path):
                return f"/static_images/{safe_title}.{ext}"

    # Default fallback
    return "/static_images/placeholder.png"

# === ROUTES ===
@app.route("/api/items")
def get_items():
    previews = []
    for _, row in items.iterrows():
        item_preview = generate_item_preview(row)
        item_preview["image"] = get_image_for_item(row["item_id"], row["Clothes Title"])
        previews.append(item_preview)
    return jsonify({"count": len(previews), "items": previews})

@app.route("/api/category/<string:dept>")
def category_items(dept):
    mask = items["Department Name"].str.lower().eq(dept.lower())
    previews = []
    for _, row in items[mask].iterrows():
        item_preview = generate_item_preview(row)
        item_preview["image"] = get_image_for_item(row["item_id"], row["Clothes Title"])
        previews.append(item_preview)
    return jsonify({"count": len(previews), "items": previews})


@app.route("/api/top-rated")
def top_rated():
    """Return top 5 items with the highest average rating."""
    grouped = (
        df.groupby("Clothes Title")["Rating"]
        .mean()
        .sort_values(ascending=False)
        .head(5)
        .index
    )
    top_items = items[items["Clothes Title"].isin(grouped)]

    previews = []
    for _, row in top_items.iterrows():
        item_preview = generate_item_preview(row)
        item_preview["image"] = get_image_for_item(row["item_id"], row["Clothes Title"])
        previews.append(item_preview)

    return jsonify({"count": len(previews), "items": previews})


@app.route("/api/recent-reviews")
def recent_reviews():
    if reviews_added.empty:
        return jsonify({"items": []})
    recent = reviews_added.sort_index(ascending=False).head(5)
    return jsonify({"items": recent.to_dict(orient="records")})

@app.route("/api/top-reviewed")
def top_reviewed():
    """Return top 5 most-reviewed items."""
    if reviews_added.empty:
        return jsonify({"items": []})

    top_counts = reviews_added["item_id"].value_counts().head(5).index
    top_items = items[items["item_id"].isin(top_counts)]

    previews = []
    for _, row in top_items.iterrows():
        item_preview = generate_item_preview(row)
        item_preview["image"] = get_image_for_item(row["item_id"], row["Clothes Title"])
        previews.append(item_preview)
    return jsonify({"count": len(previews), "items": previews})


@app.route("/api/search")
def search_items():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"count": 0, "items": [], "message": "Empty query"})
    qn = normalize_search_query(q)
    mask = items.apply(
        lambda r: qn in normalize_search_query(str(r.get("Clothes Title",""))) or
                  qn in normalize_search_query(str(r.get("Clothes Description",""))) or
                  qn in normalize_search_query(str(r.get("Class Name",""))), axis=1)
    matched = items[mask]
    previews = []
    for _, row in matched.iterrows():
        item_preview = generate_item_preview(row)
        item_preview["image"] = get_image_for_item(row["item_id"], row["Clothes Title"])
        previews.append(item_preview)
    return jsonify({"count": len(previews), "items": previews, "message": f'{len(previews)} items matched for "{q}"'})

@app.route("/api/item/<int:item_id>")
def item_detail(item_id):
    if item_id not in items["item_id"].values:
        return jsonify({"error": "Item not found"}), 404
    row = items[items["item_id"] == item_id].iloc[0]
    orig = df[df["Clothes Title"] == row["Clothes Title"]][["Title", "Review Text", "Rating", "Recommended IND"]].rename(columns={"Recommended IND": "recommended"})
    added = reviews_added[reviews_added["item_id"] == item_id][["title", "review_text", "rating", "final_recommend"]].rename(columns={"title": "Title", "review_text": "Review Text", "final_recommend": "recommended"})
    allrev = pd.concat([orig, added], ignore_index=True)
    # ✅ Sort latest reviews first (newest bottom-most in CSV)
    allrev = allrev[::-1].reset_index(drop=True)
    item = generate_item_preview(row)
    item["image"] = get_image_for_item(row["item_id"], row["Clothes Title"])
    item["reviews"] = allrev.to_dict(orient="records")
    return jsonify(safe_json(item))



@app.route("/api/review", methods=["POST"])
def add_review():
    p = request.json or {}
    item_id = int(p.get("item_id", 0))
    title = p.get("title","").strip()
    text = p.get("review_text","").strip()
    rating = int(p.get("rating",0))
    override = p.get("override",None)
    pred, conf = model.predict_with_conf(text)
    final = int(override) if override is not None and override in [0,1,"0","1"] else pred
    global reviews_added
    new = {"item_id":item_id,"title":title,"review_text":text,"rating":rating,
           "predicted_recommend":pred,"final_recommend":final,"confidence":conf}
    reviews_added = pd.concat([reviews_added,pd.DataFrame([new])],ignore_index=True)
    reviews_added.to_csv(REVIEWS_ADDED,index=False)
    return jsonify({"predicted":pred,"confidence":conf,"final":final,"message":"Review added successfully"})

@app.route("/static_images/<path:filename>")
def static_images(filename):
    return send_from_directory(os.path.join(BASE_DIR,"static_images"), filename)

@app.route("/", defaults={"path":""})
@app.route("/<path:path>")
def serve_react(path):
    build = os.path.join(BASE_DIR,"..","frontend","build")
    if path and os.path.exists(os.path.join(build,path)):
        return send_from_directory(build,path)
    return send_from_directory(build,"index.html")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
