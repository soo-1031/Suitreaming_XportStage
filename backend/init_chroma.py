#!/usr/bin/env python
"""
Script to initialize and populate Chroma vector store with PAMS data
Run this script once to set up the vector database
"""

import os
import sys
from chroma_store import ChromaVectorStore
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Initialize Chroma DB with PAMS data"""
    
    # Check if PAMS.csv exists
    csv_path = "PAMS.csv"
    if not os.path.exists(csv_path):
        logger.error(f"PAMS.csv not found in {os.getcwd()}")
        logger.info("Please ensure PAMS.csv is in the backend directory")
        sys.exit(1)
    
    # Initialize vector store
    logger.info("Initializing Chroma vector store...")
    store = ChromaVectorStore(persist_directory="./chroma_db")
    
    # Load PAMS data
    logger.info("Loading PAMS data into vector store...")
    store.load_pams_data(csv_path)
    
    # Test the store with a sample query
    logger.info("\n=== Testing vector store with sample queries ===")
    
    test_queries = [
        "rock music festival",
        "jazz performance",
        "classical music concert",
        "dance performance",
        "theater drama"
    ]
    
    for query in test_queries:
        logger.info(f"\nSearching for: '{query}'")
        results = store.search_similar(query, n_results=3)
        
        for i, (id, distance, metadata) in enumerate(zip(
            results["ids"], 
            results["distances"], 
            results["metadatas"]
        ), 1):
            similarity = 1 - distance
            logger.info(
                f"  {i}. {metadata.get('Title', 'N/A')[:50]} "
                f"- {metadata.get('Artist', 'N/A')[:30]} "
                f"(similarity: {similarity:.3f})"
            )
    
    logger.info("\n=== Chroma vector store initialization complete ===")
    logger.info(f"Database location: ./chroma_db")
    logger.info(f"Total documents: {store.collection.count()}")

if __name__ == "__main__":
    main()