
# backend/models.py
import os
import numpy as np
import pickle
from gensim.models import FastText

class ModelWrapper:
    """Loads FastText model, TF-IDF vectorizer, and logistic regression model.
    Exposes a .predict(text) -> 0/1 method.
    Paths should be passed as full paths (or relative to app.py)."""
    def __init__(self, fasttext_path='fasttext_model.bin', tfidf_path='tfidf_vectorizer.pkl', lr_path='logistic_regression_model.pkl'):
        # Allow paths that point to parent folder (user uploaded files)
        self.fasttext_path = fasttext_path
        self.tfidf_path = tfidf_path
        self.lr_path = lr_path

        print('Loading FastText from', fasttext_path)
        if os.path.exists(fasttext_path):
            self.ft = FastText.load(fasttext_path)
        else:
            print('Warning: FastText file not found at', fasttext_path)
            self.ft = None

        print('Loading TF-IDF vectorizer from', tfidf_path)
        if os.path.exists(tfidf_path):
            with open(tfidf_path, 'rb') as f:
                self.tfidf = pickle.load(f)
        else:
            print('Warning: TF-IDF vectorizer not found at', tfidf_path)
            self.tfidf = None

        print('Loading Logistic Regression from', lr_path)
        if os.path.exists(lr_path):
            with open(lr_path, 'rb') as f:
                self.lr = pickle.load(f)
        else:
            print('Warning: Logistic regression model not found at', lr_path)
            self.lr = None

    def vectorize_text(self, text):
        """Vectorize single review into fixed-length vector using TF-IDF weights and FastText word vectors.
           If FastText not available, fallback to TF-IDF sparse vector (dense) if LR supports it.
        """
        if not text:
            return np.zeros(self.output_dim())

        toks = str(text).split()

        if self.tfidf is None:
            # fallback - simple average of fasttext or zero
            if self.ft:
                vecs = [self.ft.wv[w] for w in toks if w in self.ft.wv]
                if vecs:
                    return np.mean(vecs, axis=0)
                else:
                    return np.zeros(self.output_dim())
            else:
                return np.zeros(self.output_dim())

        # Get tfidf vector (sparse)
        tfidf_vec = self.tfidf.transform([text])
        feature_names = list(self.tfidf.get_feature_names_out())
        # Build weighted average
        weighted = []
        weights = []
        if self.ft:
            for word in toks:
                if word in feature_names and word in self.ft.wv:
                    idx = feature_names.index(word)
                    w = float(tfidf_vec[0, idx])
                    if w > 0:
                        weighted.append(self.ft.wv[word] * w)
                        weights.append(w)
        # If we have weighted vectors, average them
        if len(weights) > 0:
            vec = sum(weighted) / sum(weights)
            return vec
        # Fallback: if LR expects tfidf vector, return dense tfidf
        if self.lr is not None and hasattr(self.lr, 'coef_') and tfidf_vec.shape[1] == self.lr.coef_.shape[1]:
            return tfidf_vec.toarray()[0]

        # Otherwise fallback to mean of word vectors
        if self.ft:
            vecs = [self.ft.wv[w] for w in toks if w in self.ft.wv]
            if vecs:
                return np.mean(vecs, axis=0)

        return np.zeros(self.output_dim())

    def output_dim(self):
        # If lr expects a certain input size, try to return that
        if self.lr is not None and hasattr(self.lr, 'coef_'):
            return self.lr.coef_.shape[1]
        if self.ft is not None:
            return self.ft.vector_size
        return 100

    def predict(self, text):
        vec = self.vectorize_text(text)
        # Ensure shape
        vec = np.asarray(vec).reshape(1, -1)
        if self.lr is None:
            print('No logistic model -- defaulting to not recommended (0)')
            return 0
        try:
            pred = self.lr.predict(vec)[0]
            return int(pred)
        except Exception as e:
            print('Prediction error:', e)
            # Attempt to coerce types e.g. classifier expects sparse
            try:
                pred = self.lr.predict(vec.astype(np.float32))[0]
                return int(pred)
            except Exception:
                return 0
