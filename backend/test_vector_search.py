#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from chroma_store import ChromaVectorStore

def test_vector_search():
    print("=== Testing Vector Search ===")

    try:
        # Initialize ChromaDB
        store = ChromaVectorStore()
        print(f"Collection count: {store.collection.count()}")

        # Test search
        query = "rock music"
        print(f"\nSearching for: '{query}'")

        results = store.search_similar(query, n_results=5)
        print(f"Raw results structure: {list(results.keys())}")
        print(f"Number of results: {len(results.get('ids', []))}")

        if results.get('ids'):
            for i, (id, distance, metadata) in enumerate(zip(
                results['ids'],
                results['distances'],
                results['metadatas']
            )):
                similarity = 1 - distance
                print(f"\n{i+1}. ID: {id}")
                print(f"   Title: {metadata.get('Title', 'N/A')}")
                print(f"   Artist: {metadata.get('Artist', 'N/A')}")
                print(f"   Genre: {metadata.get('Genre', 'N/A')}")
                print(f"   Distance: {distance:.4f}")
                print(f"   Similarity: {similarity:.4f}")
        else:
            print("No results found")

        # Test different queries
        test_queries = ["dance", "traditional", "modern", "performance"]
        for test_query in test_queries:
            print(f"\n--- Testing query: '{test_query}' ---")
            test_results = store.search_similar(test_query, n_results=3)
            if test_results.get('ids'):
                for i, (id, distance, metadata) in enumerate(zip(
                    test_results['ids'][:3],
                    test_results['distances'][:3],
                    test_results['metadatas'][:3]
                )):
                    print(f"  {i+1}. {metadata.get('Title', 'N/A')} (similarity: {1-distance:.3f})")
            else:
                print(f"  No results for '{test_query}'")

    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"Full traceback:\n{traceback.format_exc()}")

if __name__ == "__main__":
    test_vector_search()