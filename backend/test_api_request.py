#!/usr/bin/env python3

import requests
import json

def test_search_api():
    print("=== Testing /api/chroma/search via HTTP ==")

    try:
        url = "http://localhost:8000/api/chroma/search"
        payload = {"query": "rock music", "n_results": 5}

        print(f"Sending request to: {url}")
        print(f"Payload: {payload}")

        response = requests.post(url, json=payload, timeout=30)
        print(f"Status code: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")

        if response.status_code == 200:
            result = response.json()
            print(f"Success! Result: {result}")
        else:
            print(f"Error response: {response.text}")

    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"Full traceback:\n{traceback.format_exc()}")

if __name__ == "__main__":
    test_search_api()