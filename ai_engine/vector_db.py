"""
Vector Database index management utilizing FAISS.
Falls back to a pure numpy memory-based cosine similarity index if FAISS is not installed.
"""
from __future__ import annotations

import os
import pickle
import numpy as np

# Load FAISS if available
try:
    import faiss
    _FAISS_AVAILABLE = True
except ImportError:
    faiss = None
    _FAISS_AVAILABLE = False


class VectorIndex:
    """Vector database index using FAISS or numpy fallback."""

    def __init__(self, dimension: int):
        self.dimension = dimension
        self.ids: list[str] = []
        self.vectors: list[np.ndarray] = []
        
        # FAISS index
        self.index = None
        if _FAISS_AVAILABLE and faiss is not None:
            # IndexFlatIP uses inner product (cosine similarity if normalized)
            self.index = faiss.IndexFlatIP(dimension)

    def add(self, vector_id: str, vector: list[float] | np.ndarray) -> None:
        """Add a single vector with an associated ID to the database."""
        vec = np.array(vector, dtype=np.float32)
        if vec.shape[0] != self.dimension:
            raise ValueError(f"Vector dimension {vec.shape[0]} does not match index dimension {self.dimension}")
            
        # L2 Normalize for cosine similarity
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
            
        self.ids.append(vector_id)
        self.vectors.append(vec)
        
        if self.index is not None:
            # Reshape to 2D array [1, dimension] for FAISS
            faiss_vec = np.expand_dims(vec, axis=0)
            self.index.add(faiss_vec)

    def search(self, query_vector: list[float] | np.ndarray, top_k: int = 5) -> list[tuple[str, float]]:
        """Search similar vectors and return list of (id, cosine_similarity_score)."""
        if not self.ids:
            return []
            
        vec = np.array(query_vector, dtype=np.float32)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
            
        top_k = min(top_k, len(self.ids))
        
        if self.index is not None:
            faiss_vec = np.expand_dims(vec, axis=0)
            # FAISS returns distances and indices
            similarities, indices = self.index.search(faiss_vec, top_k)
            results = []
            for sim, idx in zip(similarities[0], indices[0]):
                if idx >= 0 and idx < len(self.ids):
                    results.append((self.ids[idx], float(sim)))
            return results
            
        # Numpy fallback: Compute dot products for all vectors
        stacked_vectors = np.stack(self.vectors)
        # Cosine similarity is simply the dot product since vectors are normalized
        sims = np.dot(stacked_vectors, vec)
        
        # Get top K indices sorted descending
        top_indices = np.argsort(sims)[::-1][:top_k]
        
        return [(self.ids[idx], float(sims[idx])) for idx in top_indices]

    def save(self, file_path: str) -> None:
        """Save the vector database to a local file."""
        os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
        data = {
            "dimension": self.dimension,
            "ids": self.ids,
            "vectors": self.vectors
        }
        with open(file_path, "wb") as f:
            pickle.dump(data, f)
            
        if self.index is not None and faiss is not None:
            faiss_path = file_path + ".faiss"
            faiss.write_index(self.index, faiss_path)

    @classmethod
    def load(cls, file_path: str) -> VectorIndex:
        """Load the vector database from a local file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Index file not found: {file_path}")
            
        with open(file_path, "rb") as f:
            data = pickle.load(f)
            
        instance = cls(data["dimension"])
        instance.ids = data["ids"]
        instance.vectors = data["vectors"]
        
        faiss_path = file_path + ".faiss"
        if os.path.exists(faiss_path) and faiss is not None:
            instance.index = faiss.read_index(faiss_path)
            
        return instance
