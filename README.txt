===========================================================
Assignment 3 – Milestone II
FashionPulse: AI-Based Online Shopping Website
===========================================================

Student Name: CHETAN YADAV VENKATESH
Student ID: s4137946
Course: Advanced Programming
Institution: RMIT University

-----------------------------------------------------------
1. PROJECT OVERVIEW
-----------------------------------------------------------
FashionPulse is a Flask + React-based online shopping website that allows users to browse women’s clothing items, read and write reviews, and get AI-generated product recommendations.

This project builds on Milestone I, where a machine learning model was trained using the “Women’s E-Commerce Clothing Reviews” dataset. 
In this milestone, that model is integrated into a real web application to automatically classify new reviews as either:
   • Recommended (1)
   • Not Recommended (0)

Users can:
 - Browse all clothing items.
 - Search items using intelligent keyword normalization 
   (e.g., “dress” and “dresses” give the same results).
 - View detailed item information and reviews.
 - Add new reviews with AI-based recommendation prediction.
 - Override the model’s suggestion if desired.
 - Instantly see their new review appear on the product page.

-----------------------------------------------------------
2. TECHNOLOGIES USED
-----------------------------------------------------------
Frontend:
 - React (create-react-app)
 - Axios (for API calls)
 - CSS (for responsive design)
 - Lucide React (icons)
 - React Toastify (for status popups)
 - React Loading Skeleton (for loading states)

Backend:
 - Flask (Python)
 - Pandas, NumPy
 - Scikit-Learn (CountVectorizer + Logistic Regression)
 - Joblib (model loading)
 - CORS (for frontend–backend communication)

-----------------------------------------------------------
3. PROJECT STRUCTURE
-----------------------------------------------------------

data_milestone_II/
│
├── backend/
│   ├── app.py                 → Flask backend (main entry point)
│   ├── utils.py               → Helper functions for data prep & normalization
│   ├── count_vectorizer.pkl   → Trained text vectorizer
│   ├── logistic_regression_model.pkl → Trained classification model
│   ├── reviews_added.csv      → File that stores new user reviews
│   └── static_images/         → Contains product images (item_1.png, etc.)
│
└── frontend/
    ├── src/
    │   ├── App.jsx            → Main React file
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProductGrid.jsx
    │   │   ├── ProductCard.jsx
    │   │   ├── ItemPage.jsx
    │   │   ├── ReviewForm.jsx
    │   │   └── Footer.jsx
    │   └── api.js             → Axios base URL
    └── public/ and build/     → Frontend assets

-----------------------------------------------------------
4. HOW TO RUN THE APPLICATION LOCALLY
-----------------------------------------------------------

=== A. BACKEND SETUP ===
1. Open a terminal and navigate to:
      cd backend

2. Create and activate a virtual environment:
      python -m venv venv
      venv\Scripts\activate      (on Windows)
      source venv/bin/activate   (on Mac/Linux)

3. Install the required packages:
      pip install flask flask-cors pandas numpy scikit-learn joblib

4. Run the Flask app:
      python app.py

   By default, Flask will start at:
      http://localhost:5000/

   You should see messages like:
      * Running on http://127.0.0.1:5000

---

=== B. FRONTEND SETUP ===
1. Open another terminal and navigate to:
      cd frontend

2. Install dependencies:
      npm install

3. Start the React development server:
      npm start

   React will run at:
      http://localhost:3000/

4. The React frontend automatically communicates with the Flask backend running on port 5000.

-----------------------------------------------------------
5. KEY FEATURES TO DEMONSTRATE
-----------------------------------------------------------
Clothes browsing (homepage + categories)  
Intelligent keyword search (handles plural/singular forms)  
Product details page (with rating and reviews)  
AI-based review recommendation with model confidence  
Manual override option for user control  
Persistent review storage (`reviews_added.csv`)  
Review immediately visible after submission  

-----------------------------------------------------------
6. HOW TO TEST THE SYSTEM
-----------------------------------------------------------
1. Open http://localhost:3000  
2. Browse through clothing items.  
3. Use the search bar to find items (e.g., type “dress”).  
4. Click any product card to view details.  
5. Scroll down and submit a new review:
     - Write a review title and text.
     - Click “Get Model Suggestion.”
     - See AI’s recommendation and confidence.
     - Optionally change it via override dropdown.
     - Click “Confirm & Submit.”
6. The page refreshes and displays your new review.
7. You can also check the backend at:
      http://localhost:5000/api/item/<item_id>( please dont forget to check this , its not included in the video)

-----------------------------------------------------------
7. TROUBLESHOOTING
-----------------------------------------------------------
If you see an error such as:
  • “ModuleNotFoundError: No module named ‘textblob’” → install missing dependency using pip.
  • “404 on /api/top-rated” → the Top Rated route may be disabled in this version (safe to ignore).
  • “CORS error” → ensure both frontend and backend are running simultaneously.

-----------------------------------------------------------
8. VIDEO DEMONSTRATION
-----------------------------------------------------------
The accompanying MP4 video file shows:
  1. Clothes browsing and search.
  2. Creating a new review and seeing the AI prediction.
  3. Displaying the newly added review on the product page.

-----------------------------------------------------------
9. NOTES
-----------------------------------------------------------
- Dataset used: Modified “Women’s E-Commerce Clothing Reviews” (Kaggle)
- The project satisfies all CLO 5 and CLO 6 requirements.
- Total runtime is under 1 minute for Flask startup and full UI rendering.
- No login or authentication is required as per assignment brief.

-----------------------------------------------------------
10. CONTACT
-----------------------------------------------------------
For any clarifications:
Name : CHETAN YADAV VENKATESH
Email : s4137946@student.rmit.edu.au
Student ID : s4137946

===========================================================
END OF README
===========================================================
