from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Generator
from pydantic import BaseModel
import os
import shutil
import json
import requests
import time
from contextlib import asynccontextmanager
import xml.etree.ElementTree as ET

from models import (
    Showcase, BookerProfile, MatchingRequest,
    SimilarityRequest, MatchingResult, VenueFitScore
)
from database import Database
from matching import MatchingService
from chroma_store import ChromaVectorStore
from kopis_api import get_current_genre_indices

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global chroma_store

    if os.path.exists("PAMS.csv"):
        print("Loading PAMS.csv into database...")
        db.load_from_csv("PAMS.csv")
        print("Data loaded successfully!")

        # Initialize Chroma vector store
        print("Initializing Chroma vector store...")
        chroma_store = ChromaVectorStore(persist_directory="./chroma_db")

        # Reset and reload vector store to ensure correct ID mapping
        print("Resetting and reloading Chroma vector store for correct ID mapping...")
        chroma_store.reset_collection()
        chroma_store.load_pams_data("PAMS.csv")
        print(f"Vector store reloaded with {chroma_store.collection.count()} documents")
    else:
        print("Warning: PAMS.csv not found")

    yield
    # Shutdown
    print("Shutting down...")

app = FastAPI(title="Sootreaming PoC API", version="1.0.0", lifespan=lifespan)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
db = Database()
matching_service = MatchingService()
chroma_store = None  # Will be initialized on startup

# Copy PAMS.csv to backend directory if not exists
if not os.path.exists("PAMS.csv"):
    source_path = "../../PAMS.csv"
    if os.path.exists(source_path):
        shutil.copy(source_path, "PAMS.csv")
        print("Copied PAMS.csv to backend directory")


@app.get("/")
def read_root():
    return {"message": "Sootreaming PoC API is running"}

@app.get("/api/showcases", response_model=List[Showcase])
def get_all_showcases():
    """Get all showcases"""
    return db.get_all_showcases()

@app.get("/api/showcases/{showcase_id}", response_model=Showcase)
def get_showcase(showcase_id: int):
    """Get a specific showcase by ID"""
    showcase = db.get_showcase_by_id(showcase_id)
    if not showcase:
        raise HTTPException(status_code=404, detail="Showcase not found")
    return showcase


@app.post("/api/matching/similar", response_model=List[MatchingResult])
def find_similar_showcases(request: SimilarityRequest):
    """Find similar showcases using Chroma vector similarity"""
    if not chroma_store:
        raise HTTPException(status_code=503, detail="Vector store not initialized")

    target_showcase = db.get_showcase_by_id(request.showcase_id)
    if not target_showcase:
        raise HTTPException(status_code=404, detail="Showcase not found")

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

    # Search for similar showcases
    results = chroma_store.search_similar(query_text, n_results=request.top_k + 1)

    # Format results (excluding the target showcase itself)
    similar = []
    for i, (id, distance, metadata) in enumerate(zip(
        results["ids"],
        results["distances"],
        results["metadatas"]
    )):
        # Skip if it's the same showcase
        showcase_id = int(id.split('_')[1]) if id.startswith('pams_') else -1

        if showcase_id == request.showcase_id:
            continue

        # Get showcase from database
        showcase = db.get_showcase_by_id(showcase_id)
        if showcase:
            similarity_score = 1 - distance
            similar.append(MatchingResult(
                showcase=showcase,
                similarity_score=similarity_score,
                matching_factors=["BGE-M3 semantic similarity"]
            ))

    return similar[:request.top_k]

@app.post("/api/matching/recommend", response_model=List[MatchingResult])
def get_recommendations(request: MatchingRequest):
    """Get showcase recommendations for a booker profile using Chroma"""
    if not chroma_store:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    
    # Use the search-by-profile functionality
    profile = request.booker_profile
    query_parts = []
    if profile.preferred_genres:
        query_parts.append(f"Genre: {', '.join(profile.preferred_genres)}")
    if profile.venue_type:
        query_parts.append(f"Venue: {profile.venue_type}")
    if profile.target_audience:
        query_parts.append(f"Audience: {profile.target_audience}")
    if profile.themes_of_interest:
        query_parts.append(f"Themes: {', '.join(profile.themes_of_interest)}")
    
    query_text = " | ".join(query_parts) if query_parts else "showcase performance"
    
    results = chroma_store.search_similar(query_text, n_results=request.top_k)
    
    # Format results
    recommendations = []
    for i, (id, distance, metadata) in enumerate(zip(
        results["ids"], 
        results["distances"], 
        results["metadatas"]
    )):
        showcase_id = int(id.split('_')[1]) if id.startswith('pams_') else -1
        showcase = db.get_showcase_by_id(showcase_id)
        if showcase:
            recommendations.append(MatchingResult(
                showcase=showcase,
                similarity_score=1 - distance,
                matching_factors=["BGE-M3 semantic similarity", "Profile-based matching"]
            ))
    
    return recommendations

@app.get("/api/showcases/{showcase_id}/venue-fit", response_model=VenueFitScore)
def get_venue_fit_score(showcase_id: int, venue: str = None):
    """Calculate venue fit score for a showcase"""
    showcase = db.get_showcase_by_id(showcase_id)
    if not showcase:
        raise HTTPException(status_code=404, detail="Showcase not found")
    
    score = matching_service.calculate_venue_fit(showcase, venue)
    return score

@app.get("/api/genres")
def get_all_genres():
    """Get all unique genres from showcases"""
    showcases = db.get_all_showcases()
    genres = set()
    
    for showcase in showcases:
        if showcase.genre:
            # Split by comma and clean
            genre_parts = [g.strip() for g in showcase.genre.split(',')]
            genres.update(genre_parts)
    
    return {"genres": sorted(list(genres))}

@app.get("/api/venues")
def get_all_venues():
    """Get all unique venues from showcases"""
    showcases = db.get_all_showcases()
    venues = set()
    
    for showcase in showcases:
        if showcase.venue:
            venues.add(showcase.venue)
    
    return {"venues": sorted(list(venues))}

class SearchRequest(BaseModel):
    query: str
    n_results: int = 10

@app.post("/api/chroma/search")
def search_chroma(request: SearchRequest):
    """Search showcases using Chroma vector similarity"""
    print(f"SIMPLE LOG: API called with query: {request.query}")

    if not chroma_store:
        return {"error": "Vector store not initialized"}

    print("SIMPLE LOG: Starting search...")
    results = chroma_store.search_similar(request.query, n_results=request.n_results)
    print(f"SIMPLE LOG: Got {len(results.get('ids', []))} results")

    simple_results = []
    for i, (id, distance, metadata) in enumerate(zip(
        results["ids"],
        results["distances"],
        results["metadatas"]
    )):
        simple_results.append({
            "id": id,
            "title": str(metadata.get("Title", "Unknown")),
            "similarity": round(1 - distance, 3)
        })

    print("SIMPLE LOG: Returning results")
    return {
        "query": request.query,
        "results": simple_results
    }

@app.post("/api/chroma/search-by-profile")
def search_by_profile(profile: BookerProfile, n_results: int = 10):
    """Search showcases based on booker profile using Chroma"""
    if not chroma_store:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    
    # Create query text from profile
    query_parts = []
    if profile.preferred_genres:
        query_parts.append(f"Genre: {', '.join(profile.preferred_genres)}")
    if profile.venue_type:
        query_parts.append(f"Venue: {profile.venue_type}")
    if profile.target_audience:
        query_parts.append(f"Audience: {profile.target_audience}")
    if profile.themes_of_interest:
        query_parts.append(f"Themes: {', '.join(profile.themes_of_interest)}")
    
    query_text = " | ".join(query_parts)
    
    results = chroma_store.search_similar(query_text, n_results=n_results)
    
    # Format results
    formatted_results = []
    for i, (id, distance, metadata) in enumerate(zip(
        results["ids"], 
        results["distances"], 
        results["metadatas"]
    )):
        formatted_results.append({
            "rank": i + 1,
            "id": id,
            "similarity": 1 - distance,
            "title": metadata.get("Title"),
            "artist": metadata.get("Artist"),
            "genre": metadata.get("Genre"),
            "venue": metadata.get("PAMS Venue"),
            "country": metadata.get("Country") if "Country" in metadata else None,
            "metadata": metadata
        })
    
    return {
        "profile": profile,
        "query_text": query_text,
        "n_results": len(formatted_results),
        "results": formatted_results
    }

class FilteredSearchRequest(BaseModel):
    profile: BookerProfile
    query: str
    n_results: int = 10

class UserAnalysisRequest(BaseModel):
    survey_data: dict

class RecommendationStepRequest(BaseModel):
    survey_data: dict
    step: int = 1

@app.post("/api/chroma/filtered-search")
def filtered_semantic_search(request: FilteredSearchRequest):
    """Two-step search: 1) Filter by profile preferences 2) Semantic search within filtered results"""
    if not chroma_store:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    
    # Step 1: Get all showcases and filter by profile preferences (TEMPORARILY DISABLED)
    # all_showcases = db.get_all_showcases()
    # filtered_showcases = []
    
    # for showcase in all_showcases:
    #     # Filter by genre if preferences exist
    #     if request.profile.preferred_genres:
    #         genre_match = False
    #         if showcase.genre:
    #             for pref_genre in request.profile.preferred_genres:
    #                 if pref_genre.lower() in showcase.genre.lower():
    #                     genre_match = True
    #                     break
    #         if not genre_match:
    #             continue
    #     
    #     # Filter by venue type if specified
    #     if request.profile.venue_type and showcase.venue:
    #         if request.profile.venue_type.lower() not in showcase.venue.lower():
    #             continue
    #     
    #     # Filter by budget range if specified (skip for now as budget_range not in model)
    #     # if hasattr(request.profile, 'budget_range') and request.profile.budget_range and request.profile.budget_range.min > 0:
    #     #     pass
    #     
    #     filtered_showcases.append(showcase)
    
    # TEMPORARY: Skip profile filtering and just do semantic search
    all_showcases = db.get_all_showcases()
    filtered_showcases = all_showcases  # Use all showcases for now
    
    # Step 2: Perform semantic search (without profile filtering for now)
    # if not filtered_showcases:
    #     return {
    #         "query": request.query,
    #         "filtered_count": 0,
    #         "results": [],
    #         "message": "No showcases match your profile preferences"
    #     }
    
    # Perform semantic search without filtering
    results = chroma_store.search_similar(request.query, n_results=request.n_results)
    # Return all semantic search results without profile filtering
    final_results = []
    for i, (id, distance, metadata) in enumerate(zip(
        results["ids"],
        results["distances"],
        results["metadatas"]
    )):
        final_results.append({
            "rank": i + 1,
            "id": id,
            "similarity": 1 - distance,
            "title": metadata.get("Title"),
            "artist": metadata.get("Artist"),
            "genre": metadata.get("Genre"),
            "venue": metadata.get("PAMS Venue"),
            "country": metadata.get("Country") if "Country" in metadata else None,
            "metadata": metadata
        })
    
    return {
        "query": request.query,
        "profile_filtered_count": len(filtered_showcases),
        "semantic_results_count": len(final_results),
        "results": final_results
    }

@app.post("/api/chroma/reload")
def reload_chroma_store():
    """Reload Chroma vector store with fresh PAMS data"""
    global chroma_store

    if not os.path.exists("PAMS.csv"):
        raise HTTPException(status_code=404, detail="PAMS.csv not found")

    if not chroma_store:
        chroma_store = ChromaVectorStore(persist_directory="./chroma_db")

    # Reload data
    chroma_store.load_pams_data("PAMS.csv")

    return {
        "message": "Chroma vector store reloaded successfully",
        "document_count": chroma_store.collection.count()
    }

@app.post("/api/recommendation/analyze-user")
def analyze_user_with_ollama(request: UserAnalysisRequest):
    """Step 1: Analyze user survey data with Ollama to extract keywords"""
    print(f"[AI ANALYSIS] Starting user analysis with Ollama...")

    # Create prompt for Ollama
    survey_text = ""
    for key, value in request.survey_data.items():
        if value and str(value).strip():
            survey_text += f"{key}: {value}\n"

    prompt = f"""당신은 공연 추천 AI입니다. 사용자의 설문 응답을 분석해서 핵심 키워드를 추출해주세요.

설문 응답:
{survey_text}

위 설문을 바탕으로 사용자의 선호를 나타내는 핵심 키워드 3-5개를 추출해서 쉼표로 구분해서 답해주세요.
예시: 드럼, 현대무용, 실험적, 젊은층, 에너지틱

키워드:"""

    try:
        # Simulate processing time for better UX
        time.sleep(2)

        # Call Ollama API with streaming
        ollama_response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "ingu627/exaone4.0:1.2b",
                "prompt": prompt,
                "stream": True
            },
            timeout=30,
            stream=True
        )

        if ollama_response.status_code == 200:
            full_response = ""
            inference_steps = []

            # Process streaming response
            for line in ollama_response.iter_lines():
                if line:
                    try:
                        chunk = json.loads(line.decode('utf-8'))
                        if 'response' in chunk:
                            token = chunk['response']
                            full_response += token

                            # Store inference steps for frontend
                            if token.strip():
                                inference_steps.append(token)

                        if chunk.get('done', False):
                            break
                    except json.JSONDecodeError:
                        continue

            # Extract keywords from the final response
            extracted_text = full_response.strip()

            # Try to extract keywords from the final response
            keywords = []
            if "정답:" in extracted_text or "키워드:" in extracted_text:
                # Split by common separators and clean up
                keyword_section = extracted_text.split("정답:")[-1] if "정답:" in extracted_text else extracted_text.split("키워드:")[-1]
                keywords = [kw.strip().strip('"').strip("'") for kw in keyword_section.replace("\n", ",").split(",") if kw.strip() and not kw.strip().startswith("-") and len(kw.strip()) > 1]
            else:
                # Fallback: try to find comma-separated values at the end
                lines = extracted_text.strip().split('\n')
                for line in reversed(lines):
                    if ',' in line and len(line.split(',')) > 1:
                        keywords = [kw.strip().strip('"').strip("'") for kw in line.split(',') if kw.strip() and len(kw.strip()) > 1]
                        break

            # Clean and limit keywords
            keywords = [kw for kw in keywords[:5] if kw and len(kw) > 1]

            print(f"[KEYWORDS] Extracted keywords: {keywords}")

            return {
                "status": "success",
                "keywords": keywords,
                "inference_steps": inference_steps,
                "analysis_text": f"사용자 선호 분석 완료: {', '.join(keywords)}",
                "raw_response": extracted_text
            }
        else:
            print(f"[ERROR] Ollama API error: {ollama_response.status_code}")
            raise HTTPException(status_code=503, detail="Ollama service unavailable")

    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Ollama connection error: {e}")
        # Fallback to manual keyword extraction
        fallback_keywords = []
        for key, value in request.survey_data.items():
            if value and str(value).strip():
                fallback_keywords.append(str(value).strip())

        return {
            "status": "fallback",
            "keywords": fallback_keywords[:5],  # Limit to 5 keywords
            "analysis_text": f"분석 완료 (대체 분석): {', '.join(fallback_keywords[:5])}",
            "raw_response": "Ollama 연결 실패, 대체 키워드 추출 사용"
        }


@app.post("/api/recommendation/step-by-step")
def get_step_by_step_recommendations(request: RecommendationStepRequest):
    """Get recommendations with step-by-step progress display"""
    print("[DEBUG] Function called!")
    print(f"[DEBUG] Request step: {request.step}")

    try:
        print(f"[STEP-BY-STEP] Starting recommendation process - Step {request.step}")
        print(f"[STEP-BY-STEP] Survey data: {request.survey_data}")
        print(f"[STEP-BY-STEP] Chroma store status: {chroma_store is not None}")

        if request.step == 1:
            # Step 1: User Analysis (already done by analyze-user endpoint)
            return {
                "step": 1,
                "status": "completed",
                "message": "AI 기반 사용자 분석 완료",
                "progress": 50
            }

        elif request.step == 2:
            # Step 2: Similarity Search with BGE-M3
            print("[BGE-M3] Starting BGE-M3 similarity search...")

            if not chroma_store:
                raise HTTPException(status_code=503, detail="Vector store not initialized")

            # Create query from survey data
            query_parts = []
            if request.survey_data.get("performanceStyle"):
                query_parts.append(request.survey_data["performanceStyle"])
            if request.survey_data.get("culturalThemes"):
                query_parts.append(request.survey_data["culturalThemes"])

            query = " ".join(query_parts) if query_parts else "showcase performance"

            print(f"[SEARCH QUERY] Search query: '{query}'")

            # Add artificial delay to make it feel more thoughtful
            time.sleep(3)

            # Perform search
            print(f"[DEBUG] Starting ChromaDB search with query: '{query}'")
            results = chroma_store.search_similar(query, n_results=10)
            print(f"[DEBUG] Search results keys: {results.keys() if results else 'None'}")

            if not results:
                print("[ERROR] ChromaDB search returned None")
                raise Exception("ChromaDB search returned no results")

            # Check result structure
            ids = results.get("ids", [])
            distances = results.get("distances", [])
            metadatas = results.get("metadatas", [])

            print(f"[DEBUG] Results - ids: {len(ids)}, distances: {len(distances)}, metadatas: {len(metadatas)}")

            if len(ids) == 0:
                print("[DEBUG] No search results found")
                return {
                    "step": 2,
                    "status": "completed",
                    "message": "검색 결과가 없습니다",
                    "progress": 100,
                    "recommendations": [],
                    "query_used": query
                }

            # Format results
            recommendations = []
            for i, (id, distance, metadata) in enumerate(zip(ids, distances, metadatas)):
                try:
                    print(f"[DEBUG] Processing result {i}: id={id}, distance={distance}")

                    # Parse showcase ID
                    if not id or not isinstance(id, str):
                        print(f"[WARNING] Invalid ID: {id}")
                        continue

                    showcase_id = int(id.split('_')[1]) if id.startswith('pams_') else -1
                    print(f"[DEBUG] Parsed showcase_id: {showcase_id}")

                    if showcase_id <= 0:
                        print(f"[WARNING] Invalid showcase_id: {showcase_id}")
                        continue

                    showcase = db.get_showcase_by_id(showcase_id)
                    print(f"[DEBUG] Retrieved showcase: {showcase.title if showcase else 'None'}")

                    if showcase:
                        recommendations.append({
                            "showcase": {
                                "id": showcase.id,
                                "title": showcase.title,
                                "artist": showcase.artist,
                                "genre": showcase.genre,
                                "artist_description": showcase.artist_description,
                                "introduction": showcase.introduction,
                                "schedule_date": showcase.schedule_date,
                                "schedule_time": showcase.schedule_time,
                                "director": showcase.director,
                                "cast": showcase.cast,
                                "duration": showcase.duration,
                                "tour_size": showcase.tour_size,
                                "performers_count": showcase.performers_count,
                                "staff_count": showcase.staff_count,
                                "contact_names": showcase.contact_names,
                                "contact_emails": showcase.contact_emails,
                                "venue": showcase.venue,
                                "review": showcase.review
                            },
                            "similarity_score": 1 - distance,
                            "matching_factors": ["BGE-M3 semantic similarity", "Survey-based matching"]
                        })

                except Exception as item_error:
                    print(f"[ERROR] Failed to process recommendation item {i}: {str(item_error)}")
                    import traceback
                    print(f"[ERROR] Item processing traceback: {traceback.format_exc()}")
                    continue

            print(f"[SUCCESS] Found {len(recommendations)} recommendations")

            return {
                "step": 2,
                "status": "completed",
                "message": "유사도 검색 기반 맞춤 공연 추천 완료",
                "progress": 100,
                "recommendations": recommendations,
                "query_used": query
            }

        else:
            raise HTTPException(status_code=400, detail="Invalid step number")

    except Exception as e:
        import traceback
        print(f"[ERROR] Exception in step-by-step recommendations: {str(e)}")
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/recommendation/stream-analysis")
def stream_user_analysis(survey_data: str):
    """Stream real-time AI analysis with ExaONE inference"""

    def generate_stream() -> Generator[str, None, None]:
        try:
            # Parse survey data
            survey_dict = json.loads(survey_data)

            # Create prompt for Ollama
            survey_text = ""
            for key, value in survey_dict.items():
                if value and str(value).strip():
                    survey_text += f"{key}: {value}\n"

            prompt = f"""당신은 공연 추천 AI입니다. 사용자의 설문 응답을 분석해서 핵심 키워드 3-5개를 추출해주세요.

설문 응답:
{survey_text}

위 설문을 바탕으로 사용자의 선호를 나타내는 핵심 키워드 3-5개를 추출해서 쉼표로 구분해서 답해주세요.
예시: 드럼, 현대무용, 실험적, 젊은층, 에너지틱

키워드:"""

            # Send initial status
            yield f"data: {json.dumps({'type': 'status', 'message': 'AI 추론을 시작합니다...'})}\n\n"
            time.sleep(1)

            # Call Ollama API with streaming
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "ingu627/exaone4.0:1.2b",
                    "prompt": prompt,
                    "stream": True
                },
                stream=True,
                timeout=30
            )

            if response.status_code == 200:
                full_response = ""
                current_text = ""

                for line in response.iter_lines():
                    if line:
                        try:
                            chunk = json.loads(line.decode('utf-8'))
                            if 'response' in chunk:
                                token = chunk['response']
                                full_response += token
                                current_text += token

                                # Send streaming inference text (subtitle effect)
                                yield f"data: {json.dumps({'type': 'inference', 'text': current_text})}\n\n"

                                # Small delay for readability
                                time.sleep(0.05)

                            if chunk.get('done', False):
                                break
                        except json.JSONDecodeError:
                            continue

                # Extract keywords from final response
                keywords = []
                extracted_text = full_response.strip()

                if "정답:" in extracted_text or "키워드:" in extracted_text:
                    keyword_section = extracted_text.split("정답:")[-1] if "정답:" in extracted_text else extracted_text.split("키워드:")[-1]
                    keywords = [kw.strip().strip('"').strip("'") for kw in keyword_section.replace("\n", ",").split(",") if kw.strip() and not kw.strip().startswith("-") and len(kw.strip()) > 1]
                else:
                    # Fallback: try to find comma-separated values at the end
                    lines = extracted_text.strip().split('\n')
                    for line in reversed(lines):
                        if ',' in line and len(line.split(',')) > 1:
                            keywords = [kw.strip().strip('"').strip("'") for kw in line.split(',') if kw.strip() and len(kw.strip()) > 1]
                            break

                    # If still no keywords, generate from user profile data as fallback
                    if not keywords:
                        profile_keywords = []

                        # Extract keywords from user survey data
                        for key, value in survey_dict.items():
                            if value and str(value).strip():
                                value_str = str(value).strip()

                                # Skip non-informative fields
                                if key in ['firstName', 'lastName', 'email', 'phone', 'website']:
                                    continue

                                # Extract meaningful words from specific fields
                                if key == 'interestedGenres':
                                    # Map genre codes to Korean terms
                                    genre_map = {
                                        'traditional': '전통',
                                        'contemporary': '현대',
                                        'dance': '무용',
                                        'theater': '연극',
                                        'music': '음악'
                                    }
                                    if isinstance(value, list):
                                        for genre in value:
                                            if genre in genre_map:
                                                profile_keywords.append(genre_map[genre])
                                            else:
                                                profile_keywords.append(genre)
                                    else:
                                        profile_keywords.append(value_str)

                                elif key in ['performanceStyle', 'culturalThemes']:
                                    # Extract Korean words from text descriptions
                                    import re
                                    korean_words = re.findall(r'[가-힣]{2,}', value_str)
                                    meaningful_words = []
                                    for word in korean_words:
                                        if len(word) >= 2 and word not in ['합니다', '입니다', '있습니다', '됩니다', '부분', '경우', '때문', '가능', '필요']:
                                            meaningful_words.append(word)
                                    profile_keywords.extend(meaningful_words[:3])  # Limit per field

                                elif key == 'targetAudience':
                                    # Extract audience types
                                    if '젊은' in value_str or 'young' in value_str.lower():
                                        profile_keywords.append('젊은층')
                                    if '가족' in value_str or 'family' in value_str.lower():
                                        profile_keywords.append('가족')
                                    if '전문가' in value_str or 'professional' in value_str.lower():
                                        profile_keywords.append('전문가')

                        # Remove duplicates and limit to 5
                        keywords = list(dict.fromkeys(profile_keywords))[:5]

                        # If still no keywords, use default fallback
                        if not keywords:
                            keywords = ['공연', '예술', '문화', '무대']

                # Clean keywords
                keywords = [kw for kw in keywords[:5] if kw and len(kw) > 1]

                # Send ExaONE's full response instead of extracted keywords
                yield f"data: {json.dumps({'type': 'inference_complete', 'message': '분석이 완료되었습니다.'})}\n\n"
                time.sleep(1)

                # Send the full ExaONE response
                yield f"data: {json.dumps({'type': 'full_response', 'response': extracted_text})}\n\n"
                time.sleep(0.5)

                # Send completion with both full response and extracted keywords for reference
                yield f"data: {json.dumps({'type': 'complete', 'full_response': extracted_text, 'keywords': keywords})}\n\n"

            else:
                yield f"data: {json.dumps({'type': 'error', 'message': 'Ollama 연결 실패'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': f'오류 발생: {str(e)}'})}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        }
    )

# KOPIS API proxy endpoints to avoid CORS issues
API_KEY = '9e9bc3ee73e34fa0b7faa7ff8b97d045'

@app.get("/api/kopis/period-stats")
def get_period_stats(stdate: str, eddate: str):
    """Proxy KOPIS period statistics API - REAL API CALLS ONLY"""
    try:
        url = f"http://kopis.or.kr/openApi/restful/prfstsTotal"
        params = {
            'service': API_KEY,
            'stdate': stdate,
            'eddate': eddate,
            'ststype': 'day'
        }

        print(f"[KOPIS PERIOD-STATS] Calling: {url}")
        print(f"[KOPIS PERIOD-STATS] Params: {params}")

        response = requests.get(url, params=params, timeout=30)

        print(f"[KOPIS PERIOD-STATS] Response status: {response.status_code}")
        print(f"[KOPIS PERIOD-STATS] Response headers: {dict(response.headers)}")
        print(f"[KOPIS PERIOD-STATS] Response content preview: {response.text[:500]}...")

        response.raise_for_status()

        if not response.text.strip():
            raise HTTPException(status_code=502, detail="KOPIS Period Stats API returned empty response")

        return {"status": "success", "data": response.text}

    except requests.exceptions.Timeout as e:
        print(f"[KOPIS PERIOD-STATS] TIMEOUT ERROR: {e}")
        print(f"[KOPIS PERIOD-STATS] Request took longer than 30 seconds")
        raise HTTPException(status_code=504, detail=f"KOPIS Period Stats API timeout after 30 seconds: {str(e)}")

    except requests.exceptions.ConnectionError as e:
        print(f"[KOPIS PERIOD-STATS] CONNECTION ERROR: {e}")
        print(f"[KOPIS PERIOD-STATS] Cannot connect to KOPIS server")
        raise HTTPException(status_code=502, detail=f"Cannot connect to KOPIS Period Stats API: {str(e)}")

    except requests.exceptions.HTTPError as e:
        print(f"[KOPIS PERIOD-STATS] HTTP ERROR: {e}")
        print(f"[KOPIS PERIOD-STATS] HTTP status: {response.status_code}")
        print(f"[KOPIS PERIOD-STATS] Response body: {response.text}")
        raise HTTPException(status_code=502, detail=f"KOPIS Period Stats API HTTP error: {str(e)}")

    except Exception as e:
        print(f"[KOPIS PERIOD-STATS] UNEXPECTED ERROR: {e}")
        print(f"[KOPIS PERIOD-STATS] Error type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"KOPIS Period Stats API unexpected error: {str(e)}")

@app.get("/api/kopis/performance-list")
def get_performance_list(stdate: str, eddate: str, rows: int = 1000, prfstate: str = None):
    """Proxy KOPIS performance list API - REAL API CALLS ONLY"""
    print("CLAUDE DEBUG: PERFORMANCE-LIST ENDPOINT CALLED!")
    print("=" * 50)
    print(f"[DEBUG] ENDPOINT CALLED: /api/kopis/performance-list")
    print(f"[DEBUG] Parameters: stdate={stdate}, eddate={eddate}, rows={rows}, prfstate={prfstate}")
    print("=" * 50)
    try:
        # Real API call to KOPIS
        url = f"http://www.kopis.or.kr/openApi/restful/pblprfr"
        params = {
            'service': API_KEY,
            'stdate': stdate,
            'eddate': eddate,
            'cpage': '1',
            'rows': str(rows)
        }
        if prfstate:
            params['prfstate'] = prfstate

        print(f"[KOPIS API] Calling: {url}")
        print(f"[KOPIS API] Params: {params}")

        response = requests.get(url, params=params, timeout=30)

        print(f"[KOPIS API] Response status: {response.status_code}")
        print(f"[KOPIS API] Response headers: {dict(response.headers)}")
        print(f"[KOPIS API] Response content preview: {response.text[:500]}...")

        response.raise_for_status()

        if not response.text.strip():
            raise HTTPException(status_code=502, detail="KOPIS API returned empty response")

        return {"status": "success", "data": response.text}

    except requests.exceptions.Timeout as e:
        print(f"[KOPIS API] TIMEOUT ERROR: {e}")
        print(f"[KOPIS API] Request took longer than 30 seconds")
        raise HTTPException(status_code=504, detail=f"KOPIS API timeout after 30 seconds: {str(e)}")

    except requests.exceptions.ConnectionError as e:
        print(f"[KOPIS API] CONNECTION ERROR: {e}")
        print(f"[KOPIS API] Cannot connect to KOPIS server")
        raise HTTPException(status_code=502, detail=f"Cannot connect to KOPIS API: {str(e)}")

    except requests.exceptions.HTTPError as e:
        print(f"[KOPIS API] HTTP ERROR: {e}")
        print(f"[KOPIS API] HTTP status: {response.status_code}")
        print(f"[KOPIS API] Response body: {response.text}")
        raise HTTPException(status_code=502, detail=f"KOPIS API HTTP error: {str(e)}")

    except Exception as e:
        print(f"[KOPIS API] UNEXPECTED ERROR: {e}")
        print(f"[KOPIS API] Error type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"KOPIS API unexpected error: {str(e)}")

@app.get("/api/kopis/box-stats")
def get_box_stats(stdate: str, eddate: str, ststype: str = "day"):
    """Proxy KOPIS box office statistics API for real-time booking rankings - REAL API CALLS ONLY"""
    try:
        url = f"http://kopis.or.kr/openApi/restful/boxStats"
        params = {
            'service': API_KEY,
            'stdate': stdate,
            'eddate': eddate,
            'ststype': ststype
        }

        print(f"[KOPIS BOX-STATS] Calling: {url}")
        print(f"[KOPIS BOX-STATS] Params: {params}")

        response = requests.get(url, params=params, timeout=30)

        print(f"[KOPIS BOX-STATS] Response status: {response.status_code}")
        print(f"[KOPIS BOX-STATS] Response headers: {dict(response.headers)}")
        print(f"[KOPIS BOX-STATS] Response content preview: {response.text[:500]}...")

        response.raise_for_status()

        if not response.text.strip():
            raise HTTPException(status_code=502, detail="KOPIS Box Stats API returned empty response")

        return {"status": "success", "data": response.text}

    except requests.exceptions.Timeout as e:
        print(f"[KOPIS BOX-STATS] TIMEOUT ERROR: {e}")
        print(f"[KOPIS BOX-STATS] Request took longer than 30 seconds")
        raise HTTPException(status_code=504, detail=f"KOPIS Box Stats API timeout after 30 seconds: {str(e)}")

    except requests.exceptions.ConnectionError as e:
        print(f"[KOPIS BOX-STATS] CONNECTION ERROR: {e}")
        print(f"[KOPIS BOX-STATS] Cannot connect to KOPIS server")
        raise HTTPException(status_code=502, detail=f"Cannot connect to KOPIS Box Stats API: {str(e)}")

    except requests.exceptions.HTTPError as e:
        print(f"[KOPIS BOX-STATS] HTTP ERROR: {e}")
        print(f"[KOPIS BOX-STATS] HTTP status: {response.status_code}")
        print(f"[KOPIS BOX-STATS] Response body: {response.text}")
        raise HTTPException(status_code=502, detail=f"KOPIS Box Stats API HTTP error: {str(e)}")

    except Exception as e:
        print(f"[KOPIS BOX-STATS] UNEXPECTED ERROR: {e}")
        print(f"[KOPIS BOX-STATS] Error type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"KOPIS Box Stats API unexpected error: {str(e)}")

@app.get("/api/kopis/box-stats-price")
def get_box_stats_price(stdate: str, eddate: str):
    """Proxy KOPIS box office statistics by price range API - REAL API CALLS ONLY"""
    try:
        url = f"http://kopis.or.kr/openApi/restful/boxStatsPrice"
        params = {
            'service': API_KEY,
            'stdate': stdate,
            'eddate': eddate
        }

        print(f"[KOPIS BOX-STATS-PRICE] Calling: {url}")
        print(f"[KOPIS BOX-STATS-PRICE] Params: {params}")

        response = requests.get(url, params=params, timeout=30)

        print(f"[KOPIS BOX-STATS-PRICE] Response status: {response.status_code}")
        print(f"[KOPIS BOX-STATS-PRICE] Response headers: {dict(response.headers)}")
        print(f"[KOPIS BOX-STATS-PRICE] Response content preview: {response.text[:500]}...")

        response.raise_for_status()

        if not response.text.strip():
            raise HTTPException(status_code=502, detail="KOPIS Box Stats Price API returned empty response")

        return {"status": "success", "data": response.text}

    except requests.exceptions.Timeout as e:
        print(f"[KOPIS BOX-STATS-PRICE] TIMEOUT ERROR: {e}")
        print(f"[KOPIS BOX-STATS-PRICE] Request took longer than 30 seconds")
        raise HTTPException(status_code=504, detail=f"KOPIS Box Stats Price API timeout after 30 seconds: {str(e)}")

    except requests.exceptions.ConnectionError as e:
        print(f"[KOPIS BOX-STATS-PRICE] CONNECTION ERROR: {e}")
        print(f"[KOPIS BOX-STATS-PRICE] Cannot connect to KOPIS server")
        raise HTTPException(status_code=502, detail=f"Cannot connect to KOPIS Box Stats Price API: {str(e)}")

    except requests.exceptions.HTTPError as e:
        print(f"[KOPIS BOX-STATS-PRICE] HTTP ERROR: {e}")
        print(f"[KOPIS BOX-STATS-PRICE] HTTP status: {response.status_code}")
        print(f"[KOPIS BOX-STATS-PRICE] Response body: {response.text}")
        raise HTTPException(status_code=502, detail=f"KOPIS Box Stats Price API HTTP error: {str(e)}")

    except Exception as e:
        print(f"[KOPIS BOX-STATS-PRICE] UNEXPECTED ERROR: {e}")
        print(f"[KOPIS BOX-STATS-PRICE] Error type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"KOPIS Box Stats Price API unexpected error: {str(e)}")

@app.get("/api/kopis/box-stats-category")
def get_box_stats_category(stdate: str, eddate: str, catecode: str = None):
    """Proxy KOPIS box office statistics by category API - REAL API CALLS ONLY"""
    try:
        url = f"http://kopis.or.kr/openApi/restful/boxStatsCate"
        params = {
            'service': API_KEY,
            'stdate': stdate,
            'eddate': eddate
        }
        if catecode:
            params['catecode'] = catecode

        print(f"[KOPIS BOX-STATS-CATEGORY] Calling: {url}")
        print(f"[KOPIS BOX-STATS-CATEGORY] Params: {params}")

        response = requests.get(url, params=params, timeout=30)

        print(f"[KOPIS BOX-STATS-CATEGORY] Response status: {response.status_code}")
        print(f"[KOPIS BOX-STATS-CATEGORY] Response headers: {dict(response.headers)}")
        print(f"[KOPIS BOX-STATS-CATEGORY] Response content preview: {response.text[:500]}...")

        response.raise_for_status()

        if not response.text.strip():
            raise HTTPException(status_code=502, detail="KOPIS Box Stats Category API returned empty response")

        return {"status": "success", "data": response.text}

    except requests.exceptions.Timeout as e:
        print(f"[KOPIS BOX-STATS-CATEGORY] TIMEOUT ERROR: {e}")
        print(f"[KOPIS BOX-STATS-CATEGORY] Request took longer than 30 seconds")
        raise HTTPException(status_code=504, detail=f"KOPIS Box Stats Category API timeout after 30 seconds: {str(e)}")

    except requests.exceptions.ConnectionError as e:
        print(f"[KOPIS BOX-STATS-CATEGORY] CONNECTION ERROR: {e}")
        print(f"[KOPIS BOX-STATS-CATEGORY] Cannot connect to KOPIS server")
        raise HTTPException(status_code=502, detail=f"Cannot connect to KOPIS Box Stats Category API: {str(e)}")

    except requests.exceptions.HTTPError as e:
        print(f"[KOPIS BOX-STATS-CATEGORY] HTTP ERROR: {e}")
        print(f"[KOPIS BOX-STATS-CATEGORY] HTTP status: {response.status_code}")
        print(f"[KOPIS BOX-STATS-CATEGORY] Response body: {response.text}")
        raise HTTPException(status_code=502, detail=f"KOPIS Box Stats Category API HTTP error: {str(e)}")

    except Exception as e:
        print(f"[KOPIS BOX-STATS-CATEGORY] UNEXPECTED ERROR: {e}")
        print(f"[KOPIS BOX-STATS-CATEGORY] Error type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"KOPIS Box Stats Category API unexpected error: {str(e)}")

@app.get("/api/kopis/boxoffice")
def get_kopis_boxoffice(stdate: str, eddate: str, catecode: str = None, area: str = None, srchseatscale: str = None):
    """Proxy KOPIS boxoffice ranking API - REAL API CALLS ONLY"""
    try:
        url = f"http://www.kopis.or.kr/openApi/restful/boxoffice"
        params = {
            'service': API_KEY,
            'stdate': stdate,
            'eddate': eddate
        }

        # 선택적 파라미터 추가
        if catecode:
            params['catecode'] = catecode
        if area:
            params['area'] = area
        if srchseatscale:
            params['srchseatscale'] = srchseatscale

        print(f"[KOPIS BOXOFFICE] Calling: {url}")
        print(f"[KOPIS BOXOFFICE] Params: {params}")

        response = requests.get(url, params=params, timeout=30)

        print(f"[KOPIS BOXOFFICE] Response status: {response.status_code}")
        print(f"[KOPIS BOXOFFICE] Response headers: {dict(response.headers)}")
        print(f"[KOPIS BOXOFFICE] Response content preview: {response.text[:500]}...")

        response.raise_for_status()

        if not response.text.strip():
            raise HTTPException(status_code=502, detail="KOPIS Boxoffice API returned empty response")

        return {"status": "success", "data": response.text}

    except requests.exceptions.Timeout as e:
        print(f"[KOPIS BOXOFFICE] TIMEOUT ERROR: {e}")
        print(f"[KOPIS BOXOFFICE] Request took longer than 30 seconds")
        raise HTTPException(status_code=504, detail=f"KOPIS Boxoffice API timeout after 30 seconds: {str(e)}")

    except requests.exceptions.ConnectionError as e:
        print(f"[KOPIS BOXOFFICE] CONNECTION ERROR: {e}")
        print(f"[KOPIS BOXOFFICE] Cannot connect to KOPIS server")
        raise HTTPException(status_code=502, detail=f"Cannot connect to KOPIS Boxoffice API: {str(e)}")

    except requests.exceptions.HTTPError as e:
        print(f"[KOPIS BOXOFFICE] HTTP ERROR: {e}")
        print(f"[KOPIS BOXOFFICE] HTTP status: {response.status_code}")
        print(f"[KOPIS BOXOFFICE] Response body: {response.text}")
        raise HTTPException(status_code=502, detail=f"KOPIS Boxoffice API HTTP error: {str(e)}")

    except Exception as e:
        print(f"[KOPIS BOXOFFICE] UNEXPECTED ERROR: {e}")
        print(f"[KOPIS BOXOFFICE] Error type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"KOPIS Boxoffice API unexpected error: {str(e)}")

@app.get("/api/kopis/regional-stats")
def get_regional_stats(stdate: str, eddate: str, signgucode: str = None, signgunm: str = None):
    """Proxy KOPIS regional statistics API - prfstsAreaService for detailed area analysis"""
    try:
        url = f"http://kopis.or.kr/openApi/restful/prfstsArea"
        params = {
            'service': API_KEY,
            'stdate': stdate,
            'eddate': eddate
        }

        # 선택적 파라미터 추가
        if signgucode:
            params['signgucode'] = signgucode
        if signgunm:
            params['signgunm'] = signgunm

        print(f"[KOPIS REGIONAL-STATS] Calling: {url}")
        print(f"[KOPIS REGIONAL-STATS] Params: {params}")

        response = requests.get(url, params=params, timeout=30)

        print(f"[KOPIS REGIONAL-STATS] Response status: {response.status_code}")
        print(f"[KOPIS REGIONAL-STATS] Response headers: {dict(response.headers)}")
        print(f"[KOPIS REGIONAL-STATS] Response content preview: {response.text[:500]}...")

        response.raise_for_status()

        if not response.text.strip():
            raise HTTPException(status_code=502, detail="KOPIS Regional Stats API returned empty response")

        return {"status": "success", "data": response.text}

    except requests.exceptions.Timeout as e:
        print(f"[KOPIS REGIONAL-STATS] TIMEOUT ERROR: {e}")
        print(f"[KOPIS REGIONAL-STATS] Request took longer than 30 seconds")
        raise HTTPException(status_code=504, detail=f"KOPIS Regional Stats API timeout after 30 seconds: {str(e)}")

    except requests.exceptions.ConnectionError as e:
        print(f"[KOPIS REGIONAL-STATS] CONNECTION ERROR: {e}")
        print(f"[KOPIS REGIONAL-STATS] Cannot connect to KOPIS server")
        raise HTTPException(status_code=502, detail=f"Cannot connect to KOPIS Regional Stats API: {str(e)}")

    except requests.exceptions.HTTPError as e:
        print(f"[KOPIS REGIONAL-STATS] HTTP ERROR: {e}")
        print(f"[KOPIS REGIONAL-STATS] HTTP status: {response.status_code}")
        print(f"[KOPIS REGIONAL-STATS] Response body: {response.text}")
        raise HTTPException(status_code=502, detail=f"KOPIS Regional Stats API HTTP error: {str(e)}")

    except Exception as e:
        print(f"[KOPIS REGIONAL-STATS] UNEXPECTED ERROR: {e}")
        print(f"[KOPIS REGIONAL-STATS] Error type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"KOPIS Regional Stats API unexpected error: {str(e)}")

@app.get("/api/kopis/genre-box-stats")
def get_genre_box_stats(stdate: str, eddate: str, catecode: str = None):
    """Proxy KOPIS genre-specific box office statistics API - boxStatsCate for detailed genre analysis"""
    try:
        url = f"http://kopis.or.kr/openApi/restful/boxStatsCate"
        params = {
            'service': API_KEY,
            'stdate': stdate,
            'eddate': eddate
        }

        # 선택적 장르 코드 추가
        if catecode:
            params['catecode'] = catecode

        print(f"[KOPIS GENRE-BOX-STATS] Calling: {url}")
        print(f"[KOPIS GENRE-BOX-STATS] Params: {params}")

        response = requests.get(url, params=params, timeout=30)

        print(f"[KOPIS GENRE-BOX-STATS] Response status: {response.status_code}")
        print(f"[KOPIS GENRE-BOX-STATS] Response headers: {dict(response.headers)}")
        print(f"[KOPIS GENRE-BOX-STATS] Response content preview: {response.text[:500]}...")

        response.raise_for_status()

        if not response.text.strip():
            raise HTTPException(status_code=502, detail="KOPIS Genre Box Stats API returned empty response")

        return {"status": "success", "data": response.text}

    except requests.exceptions.Timeout as e:
        print(f"[KOPIS GENRE-BOX-STATS] TIMEOUT ERROR: {e}")
        print(f"[KOPIS GENRE-BOX-STATS] Request took longer than 30 seconds")
        raise HTTPException(status_code=504, detail=f"KOPIS Genre Box Stats API timeout after 30 seconds: {str(e)}")

    except requests.exceptions.ConnectionError as e:
        print(f"[KOPIS GENRE-BOX-STATS] CONNECTION ERROR: {e}")
        print(f"[KOPIS GENRE-BOX-STATS] Cannot connect to KOPIS server")
        raise HTTPException(status_code=502, detail=f"Cannot connect to KOPIS Genre Box Stats API: {str(e)}")

    except requests.exceptions.HTTPError as e:
        print(f"[KOPIS GENRE-BOX-STATS] HTTP ERROR: {e}")
        print(f"[KOPIS GENRE-BOX-STATS] HTTP status: {response.status_code}")
        print(f"[KOPIS GENRE-BOX-STATS] Response body: {response.text}")
        raise HTTPException(status_code=502, detail=f"KOPIS Genre Box Stats API HTTP error: {str(e)}")

    except Exception as e:
        print(f"[KOPIS GENRE-BOX-STATS] UNEXPECTED ERROR: {e}")
        print(f"[KOPIS GENRE-BOX-STATS] Error type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"KOPIS Genre Box Stats API unexpected error: {str(e)}")

@app.get("/api/kopis/genre-performance-stats")
def get_genre_performance_stats(stdate: str, eddate: str):
    """Proxy KOPIS genre performance statistics API - prfstsCate for genre-specific performance lists"""
    try:
        url = f"http://kopis.or.kr/openApi/restful/prfstsCate"
        params = {
            'service': API_KEY,
            'stdate': stdate,
            'eddate': eddate
        }

        print(f"[KOPIS GENRE-PERF-STATS] Calling: {url}")
        print(f"[KOPIS GENRE-PERF-STATS] Params: {params}")

        response = requests.get(url, params=params, timeout=30)

        print(f"[KOPIS GENRE-PERF-STATS] Response status: {response.status_code}")
        print(f"[KOPIS GENRE-PERF-STATS] Response headers: {dict(response.headers)}")
        print(f"[KOPIS GENRE-PERF-STATS] Response content preview: {response.text[:500]}...")

        response.raise_for_status()

        if not response.text.strip():
            raise HTTPException(status_code=502, detail="KOPIS Genre Performance Stats API returned empty response")

        return {"status": "success", "data": response.text}

    except requests.exceptions.Timeout as e:
        print(f"[KOPIS GENRE-PERF-STATS] TIMEOUT ERROR: {e}")
        print(f"[KOPIS GENRE-PERF-STATS] Request took longer than 30 seconds")
        raise HTTPException(status_code=504, detail=f"KOPIS Genre Performance Stats API timeout after 30 seconds: {str(e)}")

    except requests.exceptions.ConnectionError as e:
        print(f"[KOPIS GENRE-PERF-STATS] CONNECTION ERROR: {e}")
        print(f"[KOPIS GENRE-PERF-STATS] Cannot connect to KOPIS server")
        raise HTTPException(status_code=502, detail=f"Cannot connect to KOPIS Genre Performance Stats API: {str(e)}")

    except requests.exceptions.HTTPError as e:
        print(f"[KOPIS GENRE-PERF-STATS] HTTP ERROR: {e}")
        print(f"[KOPIS GENRE-PERF-STATS] HTTP status: {response.status_code}")
        print(f"[KOPIS GENRE-PERF-STATS] Response body: {response.text}")
        raise HTTPException(status_code=502, detail=f"KOPIS Genre Performance Stats API HTTP error: {str(e)}")

    except Exception as e:
        print(f"[KOPIS GENRE-PERF-STATS] UNEXPECTED ERROR: {e}")
        print(f"[KOPIS GENRE-PERF-STATS] Error type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"KOPIS Genre Performance Stats API unexpected error: {str(e)}")

@app.get("/api/kopis/genre-indices")
def get_kopis_genre_indices():
    """Get current KOPIS genre indices for ROI calculation"""
    try:
        indices = get_current_genre_indices()

        # 데이터 검증 및 메타데이터 추가
        current_time = time.time()

        return {
            "status": "success",
            "timestamp": current_time,
            "data": indices,
            "source": "KOPIS API",
            "note": "Recent 31-day genre audience share data"
        }
    except Exception as e:
        # API 실패 시 기본값 반환
        print(f"KOPIS API Error: {e}")
        return {
            "status": "fallback",
            "timestamp": time.time(),
            "data": {
                'dance': 0.60,
                'music': 0.75,
                'theater': 0.45,
                'musical': 0.70
            },
            "source": "Default values",
            "note": "Fallback data due to API unavailability",
            "error": str(e)
        }


@app.get("/api/test/chroma")
def test_chroma():
    """Test Chroma vector store"""
    try:
        if not chroma_store:
            return {"error": "Chroma store not initialized"}

        # Simple search test
        results = chroma_store.search_similar("dance", n_results=3)
        return {
            "status": "success",
            "query": "dance",
            "results_count": len(results.get("ids", [])),
            "ids": results.get("ids", [])
        }
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@app.post("/api/test/simple")
def test_simple_endpoint(request: RecommendationStepRequest):
    """Simple test endpoint"""
    print("[TEST] Simple endpoint called!")
    return {"message": "Test successful", "step": request.step}

@app.get("/api/kopis/ai-insights")
def stream_kopis_ai_insights(data: str):
    """Stream AI insights analysis of KOPIS performance data using ExaONE"""
    return {"message": "AI insights temporarily disabled for debugging"}

    def generate_insights_stream() -> Generator[str, None, None]:
        try:
            # Parse KOPIS data
            kopis_data = json.loads(data)

            # Create comprehensive analysis prompt for ExaONE with real market data
            prompt = "KOPIS 데이터 분석 보고서를 작성하세요."
            prompt += f"\n데이터: {json.dumps(kopis_data, ensure_ascii=False, indent=2)}"

            # Send initial status
            yield f"data: {json.dumps({'type': 'status', 'message': 'KOPIS 데이터 분석을 시작합니다...'})}\n\n"
            time.sleep(1)

            # Call ExaONE API with streaming
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "ingu627/exaone4.0:1.2b",
                    "prompt": prompt,
                    "stream": True
                },
                stream=True,
                timeout=60
            )

            if response.status_code == 200:
                full_response = ""
                current_text = ""

                yield f"data: {json.dumps({'type': 'thinking', 'message': 'ExaONE이 데이터를 분석 중입니다...'})}\n\n"

                for line in response.iter_lines():
                    if line:
                        try:
                            chunk = json.loads(line.decode('utf-8'))
                            if 'response' in chunk:
                                token = chunk['response']
                                full_response += token
                                current_text += token

                                # Send streaming inference text with thinking effect
                                yield f"data: {json.dumps({'type': 'inference', 'text': current_text})}\n\n"

                                # Slower delay for better readability of insights
                                time.sleep(0.1)

                            if chunk.get('done', False):
                                break
                        except json.JSONDecodeError:
                            continue

                # Send completion signal
                yield f"data: {json.dumps({'type': 'inference_complete', 'message': 'AI 인사이트 분석이 완료되었습니다.'})}\n\n"
                time.sleep(1)

                # Send final insights
                yield f"data: {json.dumps({'type': 'complete', 'insights': full_response.strip()})}\n\n"

            else:
                yield f"data: {json.dumps({'type': 'error', 'message': 'ExaONE 연결 실패'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': f'AI 분석 오류: {str(e)}'})}\n\n"

    return StreamingResponse(
        generate_insights_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)