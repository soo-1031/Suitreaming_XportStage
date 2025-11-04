import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
import pandas as pd
import os
from typing import List, Dict, Any
import logging
import requests
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChromaVectorStore:
    def __init__(self, persist_directory: str = "./chroma_db"):
        """Initialize Chroma vector store with local persistence"""
        self.persist_directory = persist_directory
        
        # Create Chroma client with persistence
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Use Ollama BGE-M3 for embeddings
        class OllamaBGEEmbeddingFunction:
            def __init__(self, ollama_url="http://localhost:11434"):
                self.ollama_url = ollama_url
                self._name = "ollama-bge-m3"

            def __call__(self, input):
                # Chroma expects 'input' parameter name - can be string or list of strings
                if isinstance(input, str):
                    texts = [input]
                else:
                    texts = input

                embeddings = []
                for text in texts:
                    try:
                        response = requests.post(
                            f"{self.ollama_url}/api/embeddings",
                            json={
                                "model": "bge-m3",
                                "prompt": text
                            },
                            timeout=30
                        )
                        response.raise_for_status()
                        embedding = response.json()["embedding"]
                        embeddings.append(embedding)
                    except requests.exceptions.RequestException as e:
                        logger.error(f"Ollama embedding request failed: {e}")
                        # Fallback to zero vector if Ollama fails
                        embeddings.append([0.0] * 1024)  # BGE-M3 has 1024 dimensions

                return embeddings

            def name(self):
                return self._name

        self.embedding_function = OllamaBGEEmbeddingFunction()
        logger.info("Using Ollama BGE-M3 for embeddings")
        
        # Get or create collection for PAMS showcases
        try:
            # Try to get existing collection first
            self.collection = self.client.get_collection(
                name="pams_showcases",
                embedding_function=self.embedding_function
            )
        except:
            # Create new collection if it doesn't exist
            self.collection = self.client.create_collection(
                name="pams_showcases",
                embedding_function=self.embedding_function,
                metadata={"hnsw:space": "cosine"}
            )
        
        logger.info(f"Initialized ChromaDB at {persist_directory}")
        logger.info(f"Collection 'pams_showcases' has {self.collection.count()} documents")
    
    def load_pams_data(self, csv_path: str = "PAMS.csv"):
        """Load PAMS data from CSV and create embeddings"""
        if not os.path.exists(csv_path):
            logger.error(f"CSV file not found: {csv_path}")
            return
        
        # Read CSV
        df = pd.read_csv(csv_path, encoding='utf-8-sig')
        logger.info(f"Loaded {len(df)} rows from {csv_path}")
        
        # Check if data already exists
        existing_count = self.collection.count()
        if existing_count > 0:
            logger.info(f"Collection already contains {existing_count} documents. Resetting...")
            self.collection.delete(where={})
        
        # Prepare documents for embedding
        documents = []
        metadatas = []
        ids = []
        
        for idx, row in df.iterrows():
            # Create text representation for embedding
            doc_text = self._create_document_text(row)
            documents.append(doc_text)

            # Store all columns as metadata
            metadata = {}
            for col in df.columns:
                value = row[col]
                # Handle NaN values - skip None values as Chroma doesn't accept them
                if pd.isna(value):
                    continue  # Skip None values
                elif isinstance(value, (int, float)):
                    metadata[col] = float(value)
                else:
                    metadata[col] = str(value)

            metadatas.append(metadata)
            # Use idx+1 to match database rowid (which starts from 1)
            ids.append(f"pams_{idx+1}")
        
        # Add to collection in batches
        batch_size = 100
        for i in range(0, len(documents), batch_size):
            batch_end = min(i + batch_size, len(documents))
            self.collection.add(
                documents=documents[i:batch_end],
                metadatas=metadatas[i:batch_end],
                ids=ids[i:batch_end]
            )
            logger.info(f"Added batch {i//batch_size + 1}/{(len(documents)-1)//batch_size + 1}")
        
        logger.info(f"Successfully embedded {len(documents)} documents")
    
    def _create_document_text(self, row) -> str:
        """Create text representation of a showcase for embedding"""
        text_parts = []
        
        # Key fields for embedding - using actual column names from PAMS.csv
        if pd.notna(row.get('Title')):
            text_parts.append(f"Title: {row['Title']}")
        
        if pd.notna(row.get('Artist')):
            text_parts.append(f"Artist: {row['Artist']}")
        
        if pd.notna(row.get('Genre')):
            text_parts.append(f"Genre: {row['Genre']}")
        
        if pd.notna(row.get('Artist description')):
            text_parts.append(f"Artist Description: {row['Artist description']}")
        
        if pd.notna(row.get('Introduction to the work')):
            text_parts.append(f"Introduction: {row['Introduction to the work']}")
        
        if pd.notna(row.get('PAMS Venue')):
            text_parts.append(f"Venue: {row['PAMS Venue']}")
        
        if pd.notna(row.get('Director')):
            text_parts.append(f"Director: {row['Director']}")
        
        if pd.notna(row.get('Cast')):
            text_parts.append(f"Cast: {row['Cast']}")
        
        if pd.notna(row.get('Review')):
            text_parts.append(f"Review: {row['Review']}")
        
        return " | ".join(text_parts)
    
    def search_similar(self, query_text: str, n_results: int = 10) -> Dict[str, Any]:
        """Search for similar showcases based on text query"""
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        
        return {
            "ids": results["ids"][0] if results["ids"] else [],
            "distances": results["distances"][0] if results["distances"] else [],
            "metadatas": results["metadatas"][0] if results["metadatas"] else [],
            "documents": results["documents"][0] if results["documents"] else []
        }
    
    def search_by_metadata(self, filters: Dict[str, Any], n_results: int = 10) -> Dict[str, Any]:
        """Search showcases by metadata filters"""
        where_clause = {}
        for key, value in filters.items():
            if value is not None:
                where_clause[key] = value
        
        results = self.collection.get(
            where=where_clause,
            limit=n_results
        )
        
        return results
    
    def get_showcase_by_id(self, showcase_id: str) -> Dict[str, Any]:
        """Get a specific showcase by its ID"""
        result = self.collection.get(
            ids=[showcase_id]
        )
        
        if result["ids"]:
            return {
                "id": result["ids"][0],
                "metadata": result["metadatas"][0] if result["metadatas"] else {},
                "document": result["documents"][0] if result["documents"] else ""
            }
        return None
    
    def update_showcase(self, showcase_id: str, metadata: Dict[str, Any], document: str = None):
        """Update a showcase's metadata and/or document"""
        if document:
            self.collection.update(
                ids=[showcase_id],
                metadatas=[metadata],
                documents=[document]
            )
        else:
            self.collection.update(
                ids=[showcase_id],
                metadatas=[metadata]
            )
    
    def delete_showcase(self, showcase_id: str):
        """Delete a showcase from the collection"""
        self.collection.delete(ids=[showcase_id])
    
    def reset_collection(self):
        """Reset the entire collection"""
        self.client.delete_collection("pams_showcases")
        self.collection = self.client.create_collection(
            name="pams_showcases",
            embedding_function=self.embedding_function,
            metadata={"hnsw:space": "cosine"}
        )
        logger.info("Collection reset successfully")


if __name__ == "__main__":
    # Test the vector store
    store = ChromaVectorStore()
    
    # Load PAMS data
    store.load_pams_data("PAMS.csv")
    
    # Test search
    results = store.search_similar("rock music concert", n_results=5)
    print(f"\nSearch results for 'rock music concert':")
    for i, (id, distance, metadata) in enumerate(zip(
        results["ids"], 
        results["distances"], 
        results["metadatas"]
    )):
        print(f"{i+1}. {metadata.get('Title', 'N/A')} - {metadata.get('Artist', 'N/A')} (similarity: {1-distance:.3f})")