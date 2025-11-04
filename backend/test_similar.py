#!/usr/bin/env python3

# Test script to debug the similar showcases functionality

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import SimilarityRequest
from database import Database
from chroma_store import ChromaVectorStore

def test_similar():
    print("=== Testing Similar Showcases Function ===")

    # Initialize database
    db = Database()
    print("Database initialized")

    # Initialize ChromaDB
    chroma_store = ChromaVectorStore()
    print("ChromaDB initialized")

    # Test showcase ID 15
    request = SimilarityRequest(showcase_id=15, top_k=5)

    try:
        print(f"Searching for similar showcases to ID: {request.showcase_id}")

        target_showcase = db.get_showcase_by_id(request.showcase_id)
        if not target_showcase:
            print("ERROR: Showcase not found")
            return

        print(f"Target showcase found: {target_showcase.title}")

        # Create query text from target showcase
        query_text = chroma_store._create_document_text({
            'Title': target_showcase.title,
            'Artist': target_showcase.artist,
            'Genre': target_showcase.genre,
            'Artist description': target_showcase.artist_description,
            'Introduction to the work': target_showcase.introduction,
            'PAMS Venue': target_showcase.venue,
            'Director': target_showcase.director,
            'Cast': target_showcase.cast,
            'Review': target_showcase.review
        })

        print(f"Query text created, length: {len(query_text)}")

        # Search for similar showcases
        results = chroma_store.search_similar(query_text, n_results=request.top_k + 1)

        print(f"Search results: {len(results.get('ids', []))} items found")
        print(f"Result structure: {list(results.keys())}")

        if 'ids' in results:
            for i, result_id in enumerate(results['ids']):
                distance = results['distances'][i] if 'distances' in results else 'N/A'
                print(f"  {i}: ID={result_id}, distance={distance}")

        # Format results (excluding the target showcase itself)
        similar = []
        for i, (id, distance, metadata) in enumerate(zip(
            results["ids"],
            results["distances"],
            results["metadatas"]
        )):
            print(f"Processing result {i}: {id}, distance: {distance}")

            # Skip if it's the same showcase
            showcase_id = int(id.split('_')[1]) if id.startswith('pams_') else -1

            if showcase_id == request.showcase_id:
                print(f"Skipping target showcase {showcase_id}")
                continue

            # Get showcase from database
            showcase = db.get_showcase_by_id(showcase_id)
            if showcase:
                similarity_score = 1 - distance
                print(f"Added similar showcase: {showcase.title}, score: {similarity_score}")
                similar.append({
                    'showcase_id': showcase_id,
                    'title': showcase.title,
                    'similarity_score': similarity_score
                })

        print(f"Final results: {len(similar)} similar showcases")
        for item in similar[:request.top_k]:
            print(f"  - {item['title']}: {item['similarity_score']:.3f}")

    except Exception as e:
        print(f"Error in test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_similar()