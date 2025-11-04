#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_direct_search():
    print("=== Testing Direct ChromaDB Search ===")

    try:
        from chroma_store import ChromaVectorStore

        # Initialize ChromaDB
        store = ChromaVectorStore()
        print(f"Collection count: {store.collection.count()}")

        # Test search
        query = "dance"
        print(f"\nSearching for: '{query}'")

        results = store.search_similar(query, n_results=3)
        print(f"Results type: {type(results)}")
        print(f"Results keys: {list(results.keys())}")
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
                print(f"   Distance: {distance:.4f}")
                print(f"   Similarity: {similarity:.4f}")
        else:
            print("No results found")

        print("\n=== Direct search test completed successfully ===")
        return True

    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"Full traceback:\n{traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = test_direct_search()
    print(f"\nTest {'PASSED' if success else 'FAILED'}")