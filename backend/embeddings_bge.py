from FlagEmbedding import BGEM3FlagModel
import numpy as np
from typing import List, Union
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BGEM3EmbeddingService:
    def __init__(self):
        """Initialize BGE-M3 embedding model"""
        logger.info("Initializing BGE-M3 embedding model...")
        try:
            # Load BGE-M3 model
            self.model = BGEM3FlagModel('BAAI/bge-m3', use_fp16=True)
            logger.info("BGE-M3 model loaded successfully!")
        except Exception as e:
            logger.error(f"Failed to load BGE-M3 model: {e}")
            logger.info("Falling back to sentence-transformers...")
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer('BAAI/bge-m3')
            self.is_sentence_transformer = True
        else:
            self.is_sentence_transformer = False
    
    def create_showcase_text(self, showcase) -> str:
        """Create text representation of showcase for embedding"""
        text_parts = []
        
        # Include all available fields for rich embedding
        if showcase.title:
            text_parts.append(f"Title: {showcase.title}")
        
        if showcase.artist:
            text_parts.append(f"Artist: {showcase.artist}")
        
        if showcase.genre:
            text_parts.append(f"Genre: {showcase.genre}")
        
        if showcase.artist_description:
            text_parts.append(f"Artist Description: {showcase.artist_description}")
        
        if showcase.introduction:
            text_parts.append(f"Introduction: {showcase.introduction}")
        
        if showcase.venue:
            text_parts.append(f"Venue: {showcase.venue}")
        
        if showcase.director:
            text_parts.append(f"Director: {showcase.director}")
        
        if showcase.cast:
            text_parts.append(f"Cast: {showcase.cast}")
        
        if showcase.review:
            text_parts.append(f"Review: {showcase.review}")
        
        return " | ".join(text_parts)
    
    def get_embedding(self, text: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """Get embedding for text using BGE-M3"""
        if isinstance(text, str):
            texts = [text]
            single = True
        else:
            texts = text
            single = False
        
        try:
            if self.is_sentence_transformer:
                # Use sentence-transformers API
                embeddings = self.model.encode(texts, normalize_embeddings=True)
            else:
                # Use FlagEmbedding API
                embeddings = self.model.encode(
                    texts, 
                    batch_size=12,
                    max_length=8192
                )['dense_vecs']
            
            if single:
                return embeddings[0].tolist()
            return [emb.tolist() for emb in embeddings]
            
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            # Return zero vector as fallback
            embedding_dim = 1024  # BGE-M3 dimension
            if single:
                return [0.0] * embedding_dim
            return [[0.0] * embedding_dim for _ in texts]
    
    def compute_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Compute cosine similarity between two embeddings"""
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # Normalize vectors
        vec1_norm = vec1 / (np.linalg.norm(vec1) + 1e-10)
        vec2_norm = vec2 / (np.linalg.norm(vec2) + 1e-10)
        
        # Compute cosine similarity
        similarity = np.dot(vec1_norm, vec2_norm)
        
        return float(similarity)
    
    def find_similar(self, target_embedding: List[float], 
                    all_embeddings: List[List[float]], 
                    top_k: int = 5) -> List[tuple]:
        """Find top-k most similar embeddings"""
        similarities = []
        
        for idx, embedding in enumerate(all_embeddings):
            if embedding:  # Skip empty embeddings
                sim = self.compute_similarity(target_embedding, embedding)
                similarities.append((idx, sim))
        
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return similarities[:top_k]

if __name__ == "__main__":
    # Test the BGE-M3 embedding service
    service = BGEM3EmbeddingService()
    
    # Test texts
    test_texts = [
        "Contemporary dance performance with electronic music",
        "Traditional Korean music concert",
        "Modern theater play about social issues"
    ]
    
    logger.info("Generating embeddings for test texts...")
    embeddings = service.get_embedding(test_texts)
    
    logger.info(f"Generated {len(embeddings)} embeddings")
    logger.info(f"Embedding dimension: {len(embeddings[0])}")
    
    # Test similarity
    sim_12 = service.compute_similarity(embeddings[0], embeddings[1])
    sim_13 = service.compute_similarity(embeddings[0], embeddings[2])
    sim_23 = service.compute_similarity(embeddings[1], embeddings[2])
    
    logger.info(f"Similarity between text 1 and 2: {sim_12:.3f}")
    logger.info(f"Similarity between text 1 and 3: {sim_13:.3f}")
    logger.info(f"Similarity between text 2 and 3: {sim_23:.3f}")