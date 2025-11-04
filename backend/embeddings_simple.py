"""
Simplified embedding service for PoC
Uses sentence-transformers instead of BGE-M3 for faster setup
"""
import numpy as np
from typing import List, Dict
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
import hashlib

class EmbeddingService:
    def __init__(self, cache_dir: str = "../data/embeddings"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        
        # Use TF-IDF for simplified embeddings (PoC)
        print("Initializing TF-IDF vectorizer for embeddings...")
        self.vectorizer = TfidfVectorizer(max_features=768, min_df=1, max_df=0.95)
        self.is_fitted = False
        self.embeddings_cache = {}
        self.load_cache()
        print("Embedding service ready!")
    
    def load_cache(self):
        """Load cached embeddings if exists"""
        cache_file = os.path.join(self.cache_dir, "embeddings_cache.pkl")
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'rb') as f:
                    self.embeddings_cache = pickle.load(f)
                    print(f"Loaded {len(self.embeddings_cache)} cached embeddings")
            except:
                self.embeddings_cache = {}
    
    def save_cache(self):
        """Save embeddings cache to disk"""
        cache_file = os.path.join(self.cache_dir, "embeddings_cache.pkl")
        with open(cache_file, 'wb') as f:
            pickle.dump(self.embeddings_cache, f)
    
    def _get_text_hash(self, text: str) -> str:
        """Generate hash for text to use as cache key"""
        return hashlib.md5(text.encode()).hexdigest()
    
    def fit_vectorizer(self, texts: List[str]):
        """Fit the TF-IDF vectorizer with all texts"""
        if not self.is_fitted and texts:
            self.vectorizer.fit(texts)
            self.is_fitted = True
            print(f"Fitted vectorizer with {len(texts)} texts")
    
    def get_embedding(self, text: str, use_cache: bool = True) -> List[float]:
        """Get embedding for a single text"""
        text_hash = self._get_text_hash(text)
        
        if use_cache and text_hash in self.embeddings_cache:
            return self.embeddings_cache[text_hash]
        
        # Generate embedding using TF-IDF
        if not self.is_fitted:
            # Fit with single text if not fitted yet
            self.vectorizer.fit([text])
            self.is_fitted = True
        
        try:
            embedding_sparse = self.vectorizer.transform([text])
            embedding_dense = embedding_sparse.toarray()[0]
            
            # Pad or truncate to 768 dimensions
            if len(embedding_dense) < 768:
                embedding = np.pad(embedding_dense, (0, 768 - len(embedding_dense)), 'constant')
            else:
                embedding = embedding_dense[:768]
            
            embedding_list = embedding.tolist()
            
            if use_cache:
                self.embeddings_cache[text_hash] = embedding_list
                self.save_cache()
            
            return embedding_list
        except:
            # Return random embedding if transformation fails
            embedding = np.random.randn(768) * 0.1
            return embedding.tolist()
    
    def get_batch_embeddings(self, texts: List[str], use_cache: bool = True) -> List[List[float]]:
        """Get embeddings for multiple texts"""
        # First, fit vectorizer with all texts if not fitted
        if not self.is_fitted:
            self.fit_vectorizer(texts)
        
        embeddings = []
        for text in texts:
            embedding = self.get_embedding(text, use_cache)
            embeddings.append(embedding)
        
        print(f"Generated embeddings for {len(texts)} texts")
        return embeddings
    
    def create_showcase_text(self, showcase) -> str:
        """Create a comprehensive text representation of a showcase for embedding"""
        parts = []
        
        # Add key fields with higher weight
        if showcase.title:
            parts.append(f"Title: {showcase.title} {showcase.title}")  # Repeat for weight
        if showcase.genre:
            parts.append(f"Genre: {showcase.genre} {showcase.genre}")
        if showcase.artist:
            parts.append(f"Artist: {showcase.artist}")
        
        # Add description with full content
        if showcase.introduction:
            # Truncate very long introductions
            intro = showcase.introduction[:1000] if len(showcase.introduction) > 1000 else showcase.introduction
            parts.append(f"Introduction: {intro}")
        if showcase.artist_description:
            desc = showcase.artist_description[:500] if len(showcase.artist_description) > 500 else showcase.artist_description
            parts.append(f"Artist Description: {desc}")
        
        # Add performance details
        if showcase.duration:
            parts.append(f"Duration: {showcase.duration}")
        if showcase.tour_size:
            parts.append(f"Tour Size: {showcase.tour_size}")
        if showcase.venue:
            parts.append(f"Venue: {showcase.venue}")
        
        # Add review for quality signal
        if showcase.review:
            review = showcase.review[:500] if len(showcase.review) > 500 else showcase.review
            parts.append(f"Review: {review}")
        
        return " | ".join(parts)