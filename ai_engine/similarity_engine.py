"""
Similarity Engine for mapping requirements to source code structures (functions, classes, APIs).
Uses the embedding engine and VectorIndex to perform similarity searches and compute mapping matrices.
"""
from __future__ import annotations

import os
from typing import TypedDict
from ai_engine.embedding_engine import get_requirement_embedding, get_code_embedding
from ai_engine.vector_db import VectorIndex

INDEX_DIR = os.getenv("INDEX_STORAGE_DIR", "./vector_indices")


class FunctionMapResult(TypedDict):
    function_id: int
    name: str
    class_name: str | None
    file_path: str
    similarity_score: float


class RequirementMappingEngine:
    """Engine to build indexes and map requirements to code elements."""

    def __init__(self, job_id: str):
        self.job_id = job_id
        # Requirements vector index uses SentenceTransformers (384 dimension)
        self.req_index = VectorIndex(dimension=384)
        # Code/functions index uses CodeBERT (768 dimension)
        self.code_index = VectorIndex(dimension=768)
        self.function_metadata: dict[str, dict] = {}

    def index_functions(self, parsed_functions: list[dict]) -> None:
        """Add all code functions to the vector database index."""
        for fn in parsed_functions:
            fn_id = str(fn["id"])
            code_snippet = fn.get("code", "")
            
            # Generate embedding
            embedding = get_code_embedding(code_snippet)
            
            # Store in code index
            self.code_index.add(fn_id, embedding)
            
            # Save metadata for retrieval
            self.function_metadata[fn_id] = {
                "id": fn["id"],
                "name": fn["name"],
                "class_name": fn.get("class_name"),
                "file_path": fn.get("file_path", "")
            }

    def map_requirement_to_functions(self, requirement_text: str, top_k: int = 5, threshold: float = 0.1) -> list[FunctionMapResult]:
        """Find the most similar code functions for a requirement based on query embeddings."""
        # 1. Embed the requirement statement (note: we use code embedding dimension if we search code)
        # To perform similarity across requirement (384-dim) and code (768-dim) directly:
        # CodeBERT embeds text as well. We can pass requirement text to get_code_embedding!
        # This aligns the text space and code space in CodeBERT.
        req_emb = get_code_embedding(requirement_text)
        
        # 2. Search CodeBERT index
        raw_matches = self.code_index.search(req_emb, top_k=top_k)
        
        results: list[FunctionMapResult] = []
        for fn_id, score in raw_matches:
            if score >= threshold and fn_id in self.function_metadata:
                meta = self.function_metadata[fn_id]
                results.append({
                    "function_id": meta["id"],
                    "name": meta["name"],
                    "class_name": meta["class_name"],
                    "file_path": meta["file_path"],
                    "similarity_score": round(score, 4)
                })
        return results

    def compute_similarity_matrix(self, requirements: list[dict], functions: list[dict]) -> dict[str, dict[str, float]]:
        """Calculate complete pairwise similarity matrix between requirements and functions."""
        matrix = {}
        for req in requirements:
            req_text = f"{req.get('title', '')} {req.get('description', '')}"
            req_emb = get_code_embedding(req_text)
            
            matrix[req["req_id"]] = {}
            for fn in functions:
                fn_code = fn.get("code", "")
                fn_emb = get_code_embedding(fn_code)
                
                # Compute cosine similarity
                dot = sum(a * b for a, b in zip(req_emb, fn_emb))
                matrix[req["req_id"]][fn["name"]] = round(max(0.0, dot), 4)
        return matrix

    def save_indices(self) -> None:
        """Save vector indexes to disk."""
        base_path = os.path.join(INDEX_DIR, self.job_id)
        os.makedirs(base_path, exist_ok=True)
        self.code_index.save(os.path.join(base_path, "code_index.bin"))

    def load_indices(self) -> None:
        """Load vector indexes from disk."""
        base_path = os.path.join(INDEX_DIR, self.job_id)
        self.code_index = VectorIndex.load(os.path.join(base_path, "code_index.bin"))
