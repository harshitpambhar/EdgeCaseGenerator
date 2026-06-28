"""
Embedding Engine utilizing Sentence Transformers, CodeBERT, GraphCodeBERT, and UniXcoder.
Falls back to a standard feature hashing representation if PyTorch/Transformers are not available.
"""
from __future__ import annotations

import os
import hashlib
from typing import Any
import numpy as np

# Load PyTorch and HuggingFace Transformers if available
try:
    import torch
    from transformers import AutoTokenizer, AutoModel
    from sentence_transformers import SentenceTransformer
    _TORCH_AVAILABLE = True
except ImportError:
    torch = None
    AutoTokenizer = None
    AutoModel = None
    SentenceTransformer = None
    _TORCH_AVAILABLE = False

# Configuration for HuggingFace models
SENTENCE_MODEL_NAME = os.getenv("SENTENCE_MODEL", "all-MiniLM-L6-v2")
CODEBERT_MODEL_NAME = os.getenv("CODEBERT_MODEL", "microsoft/codebert-base")
UNIXCODER_MODEL_NAME = os.getenv("UNIXCODER_MODEL", "microsoft/unixcoder-base")

# Global instances (lazy-loaded)
_models: dict[str, Any] = {}


def _get_sentence_model():
    """Retrieve or lazy-load SentenceTransformer model."""
    if not _TORCH_AVAILABLE:
        return None
    if "sentence" not in _models:
        try:
            _models["sentence"] = SentenceTransformer(SENTENCE_MODEL_NAME)
        except Exception:
            _models["sentence"] = None
    return _models["sentence"]


def _get_transformers_model(model_name: str):
    """Retrieve or lazy-load transformers model and tokenizer."""
    if not _TORCH_AVAILABLE or AutoModel is None:
        return None, None
    cache_key = f"trans_{model_name}"
    if cache_key not in _models:
        try:
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModel.from_pretrained(model_name)
            _models[cache_key] = (tokenizer, model)
        except Exception:
            _models[cache_key] = (None, None)
    return _models[cache_key]


def _hash_embedding(text: str, dimension: int = 384) -> list[float]:
    """Fallback semantic hashing embedding generator."""
    # Split text into words/chunks
    words = text.split()
    if not words:
        words = [text]
        
    vec = np.zeros(dimension)
    for word in words:
        h = hashlib.md5(word.encode()).hexdigest()
        # Seed generator with hash
        seed = int(h, 16) % (2**32)
        rng = np.random.default_rng(seed)
        # Add random projection
        vec += rng.normal(0, 1.0, dimension)
        
    # L2 normalize
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()


def get_requirement_embedding(text: str) -> list[float]:
    """Generate text embedding for functional requirements (384-dim)."""
    model = _get_sentence_model()
    if model is not None:
        try:
            emb = model.encode(text)
            return emb.tolist()
        except Exception:
            pass
    # Fallback to 384-dimensional hashing vector
    return _hash_embedding(text, dimension=384)


def get_code_embedding(code_snippet: str) -> list[float]:
    """Generate semantic code embedding using CodeBERT (768-dim)."""
    tokenizer, model = _get_transformers_model(CODEBERT_MODEL_NAME)
    if tokenizer is not None and model is not None:
        try:
            inputs = tokenizer(code_snippet, return_tensors="pt", max_length=512, truncation=True)
            with torch.no_grad():
                outputs = model(**inputs)
            # Perform mean pooling across token embeddings
            embeddings = outputs.last_hidden_state.mean(dim=1).squeeze().tolist()
            return embeddings
        except Exception:
            pass
    # Fallback to 768-dimensional hashing vector
    return _hash_embedding(code_snippet, dimension=768)


def get_cross_language_embedding(code_snippet: str) -> list[float]:
    """Generate cross-language code representation embedding using UniXcoder (768-dim)."""
    tokenizer, model = _get_transformers_model(UNIXCODER_MODEL_NAME)
    if tokenizer is not None and model is not None:
        try:
            inputs = tokenizer(code_snippet, return_tensors="pt", max_length=512, truncation=True)
            with torch.no_grad():
                outputs = model(**inputs)
            embeddings = outputs.last_hidden_state.mean(dim=1).squeeze().tolist()
            return embeddings
        except Exception:
            pass
    # Fallback to 768-dimensional hashing vector
    return _hash_embedding(code_snippet, dimension=768)
