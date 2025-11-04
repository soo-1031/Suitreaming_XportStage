from FlagEmbedding import BGEM3FlagModel
import numpy as np
from typing import List, Dict
import pickle
import os

class EmbeddingService:
    def __init__(self, cache_dir: str = "../data/embeddings"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        
        # Initialize BGE-M3 model
        print("Loading BGE-M3 model...")
        self.model = BGEM3FlagModel('BAAI/bge-m3', use_fp16=True)
        print("BGE-M3 model loaded successfully!")
        
        self.embeddings_cache = {}
        self.load_cache()
    
    def load_cache(self):
        """Load cached embeddings if exists"""
        cache_file = os.path.join(self.cache_dir, "embeddings_cache.pkl")
        if os.path.exists(cache_file):
            with open(cache_file, 'rb') as f:
                self.embeddings_cache = pickle.load(f)
                print(f"Loaded {len(self.embeddings_cache)} cached embeddings")
    
    def save_cache(self):
        """Save embeddings cache to disk"""
        cache_file = os.path.join(self.cache_dir, "embeddings_cache.pkl")
        with open(cache_file, 'wb') as f:
            pickle.dump(self.embeddings_cache, f)
    
    def get_embedding(self, text: str, use_cache: bool = True) -> List[float]:
        """Get embedding for a single text"""
        if use_cache and text in self.embeddings_cache:
            return self.embeddings_cache[text]
        
        # Generate embedding using BGE-M3
        embedding = self.model.encode(
            [text], 
            batch_size=1, 
            max_length=512
        )['dense_vecs'][0]
        
        # Convert to list and cache
        embedding_list = embedding.tolist()
        if use_cache:
            self.embeddings_cache[text] = embedding_list
            self.save_cache()
        
        return embedding_list
    
    def get_batch_embeddings(self, texts: List[str], use_cache: bool = True) -> List[List[float]]:
        """Get embeddings for multiple texts"""
        embeddings = []
        texts_to_encode = []
        text_indices = []
        
        # Check cache first
        for i, text in enumerate(texts):
            if use_cache and text in self.embeddings_cache:
                embeddings.append(self.embeddings_cache[text])
            else:
                texts_to_encode.append(text)
                text_indices.append(i)
                embeddings.append(None)
        
        # Encode uncached texts
        if texts_to_encode:
            print(f"Encoding {len(texts_to_encode)} new texts...")
            new_embeddings = self.model.encode(
                texts_to_encode,
                batch_size=8,
                max_length=512
            )['dense_vecs']
            
            # Update results and cache
            for idx, text, embedding in zip(text_indices, texts_to_encode, new_embeddings):
                embedding_list = embedding.tolist()
                embeddings[idx] = embedding_list
                if use_cache:
                    self.embeddings_cache[text] = embedding_list
            
            if use_cache:
                self.save_cache()
        
        return embeddings
    
    def create_showcase_text(self, showcase) -> str:
        """Create a comprehensive text representation of a showcase for embedding"""
        parts = []
        
        # Add key fields with higher weight
        if showcase.title:
            parts.append(f"Title: {showcase.title}")
        if showcase.genre:
            parts.append(f"Genre: {showcase.genre}")
        if showcase.artist:
            parts.append(f"Artist: {showcase.artist}")
        
        # Add description with full content
        if showcase.introduction:
            parts.append(f"Introduction: {showcase.introduction}")
        if showcase.artist_description:
            parts.append(f"Artist Description: {showcase.artist_description}")
        
        # Add performance details
        if showcase.duration:
            parts.append(f"Duration: {showcase.duration}")
        if showcase.tour_size:
            parts.append(f"Tour Size: {showcase.tour_size}")
        if showcase.venue:
            parts.append(f"Venue: {showcase.venue}")
        
        # Add review for quality signal
        if showcase.review:
            parts.append(f"Review: {showcase.review}")
        
        return " | ".join(parts)