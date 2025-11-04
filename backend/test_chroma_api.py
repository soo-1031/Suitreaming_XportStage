import requests
import json

BASE_URL = "http://localhost:8000"

def test_chroma_search():
    """Test Chroma vector search with various queries"""
    
    print("=" * 60)
    print("Testing Chroma Vector Search API")
    print("=" * 60)
    
    # Test queries
    test_queries = [
        ("dance", 5),
        ("music festival", 5),
        ("traditional korean", 5),
        ("contemporary dance", 5),
        ("theater performance", 5)
    ]
    
    for query, n_results in test_queries:
        print(f"\n[SEARCH] Searching for: '{query}' (top {n_results} results)")
        print("-" * 40)
        
        # Make API request
        response = requests.post(
            f"{BASE_URL}/api/chroma/search",
            params={"query": query, "n_results": n_results}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"Found {data['n_results']} results:")
            
            for result in data['results']:
                print(f"\n  {result['rank']}. {result['title']}")
                print(f"     Artist: {result['artist']}")
                print(f"     Genre: {result['genre']}")
                print(f"     Venue: {result['venue']}")
                print(f"     Similarity: {result['similarity']:.3f}")
        else:
            print(f"Error: {response.status_code} - {response.text}")

def test_profile_search():
    """Test profile-based search"""
    
    print("\n" + "=" * 60)
    print("Testing Profile-Based Search API")
    print("=" * 60)
    
    # Test profiles
    profiles = [
        {
            "name": "Dance Festival Curator",
            "preferred_genres": ["Dance", "Contemporary"],
            "venue_type": "Theater",
            "target_audience": "General Public",
            "themes_of_interest": ["Modern", "Performance Art"]
        },
        {
            "name": "Music Venue Booker",
            "preferred_genres": ["Music", "Jazz", "Rock"],
            "venue_type": "Concert Hall",
            "target_audience": "Music Lovers",
            "themes_of_interest": ["Live Performance", "Acoustic"]
        },
        {
            "name": "Multidisciplinary Arts Curator",
            "preferred_genres": ["Multidisciplinary", "Theater"],
            "venue_type": "Arts Center",
            "target_audience": "Art Enthusiasts",
            "themes_of_interest": ["Experimental", "Interactive"]
        }
    ]
    
    for profile in profiles:
        print(f"\n[PROFILE] Profile: {profile['name']}")
        print(f"   Genres: {', '.join(profile['preferred_genres'])}")
        print(f"   Venue: {profile['venue_type']}")
        print("-" * 40)
        
        # Make API request
        response = requests.post(
            f"{BASE_URL}/api/chroma/search-by-profile",
            json=profile,
            params={"n_results": 3}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"Query text: {data['query_text']}")
            print(f"\nTop {data['n_results']} recommendations:")
            
            for result in data['results']:
                print(f"\n  {result['rank']}. {result['title']}")
                print(f"     Artist: {result['artist']}")
                print(f"     Genre: {result['genre']}")
                print(f"     Similarity: {result['similarity']:.3f}")
        else:
            print(f"Error: {response.status_code} - {response.text}")

def test_chroma_info():
    """Test if Chroma is properly initialized"""
    
    print("\n" + "=" * 60)
    print("Checking Chroma Vector Store Status")
    print("=" * 60)
    
    # First, let's check if the API is running
    response = requests.get(f"{BASE_URL}/")
    if response.status_code == 200:
        print("[OK] API is running")
    else:
        print("[ERROR] API is not responding")
        return
    
    # Test a simple search to verify Chroma is working
    response = requests.post(
        f"{BASE_URL}/api/chroma/search",
        params={"query": "test", "n_results": 1}
    )
    
    if response.status_code == 200:
        print("[OK] Chroma vector store is operational")
        data = response.json()
        if data['n_results'] > 0:
            print(f"[OK] Vector store contains data (found {data['n_results']} results)")
    elif response.status_code == 503:
        print("[ERROR] Vector store not initialized")
    else:
        print(f"[WARNING] Unexpected response: {response.status_code}")

if __name__ == "__main__":
    # Check status first
    test_chroma_info()
    
    # Run search tests
    test_chroma_search()
    
    # Run profile-based search tests
    test_profile_search()
    
    print("\n" + "=" * 60)
    print("Testing Complete!")
    print("=" * 60)