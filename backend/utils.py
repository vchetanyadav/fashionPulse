import re

TOKEN_RE = r"[a-zA-Z]+(?:[-'][a-zA-Z]+)?"

def normalize_search_query(q: str) -> str:
    q = q.lower()
    q = re.sub(r"[^a-z0-9\s]", "", q)
    q = q.strip()
    if q.endswith('es'):
        q = q[:-2]
    elif q.endswith('s'):
        q = q[:-1]
    return q

def generate_item_preview(row):
    return {
        "item_id": int(row["item_id"]),
        "title": str(row.get("Clothes Title", "")),
        "short_description": str(row.get("Clothes Description", ""))[:140],
        "class_name": str(row.get("Class Name", "")),
        "department": str(row.get("Department Name", "")),
        "division": str(row.get("Division Name", "")),
        "rating_example": int(row.get("Rating", 5)) if "Rating" in row.index else 5,
        # Placeholder used until app.py assigns real image
        "image": "/static_images/placeholder.png"
    }
