#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import SimilarityRequest
from database import Database
from chroma_store import ChromaVectorStore
from main import SearchRequest, search_chroma

def test_search_api():
    print("=== Testing /api/chroma/search directly ==")

    try:
        # Create a SearchRequest object
        request = SearchRequest(query="rock music", n_results=5)
        print(f"Created request: {request}")

        # Call the search function directly
        result = search_chroma(request)
        print(f"Success! Result: {result}")

    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"Full traceback:\n{traceback.format_exc()}")

if __name__ == "__main__":
    test_search_api()