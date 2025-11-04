#!/usr/bin/env python3

import chromadb
from chromadb.config import Settings

def check_collections():
    print("=== Checking ChromaDB Collections ===")

    # Connect to ChromaDB
    client = chromadb.PersistentClient(
        path="./chroma_db",
        settings=Settings(
            anonymized_telemetry=False,
            allow_reset=True
        )
    )

    # List all collections
    collections = client.list_collections()
    print(f"Found {len(collections)} collections:")

    for collection in collections:
        print(f"\n- Collection: {collection.name}")
        print(f"  Count: {collection.count()}")

        # Get metadata if available
        try:
            metadata = collection.metadata
            if metadata:
                print(f"  Metadata: {metadata}")
        except:
            pass

        # Show first few documents
        try:
            if collection.count() > 0:
                sample = collection.get(limit=2)
                print(f"  Sample IDs: {sample['ids'][:2] if sample['ids'] else 'None'}")
                if sample['metadatas']:
                    print(f"  Sample metadata keys: {list(sample['metadatas'][0].keys()) if sample['metadatas'][0] else 'None'}")
        except Exception as e:
            print(f"  Error getting sample: {e}")

if __name__ == "__main__":
    check_collections()