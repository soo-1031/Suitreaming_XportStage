from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Showcase(BaseModel):
    id: Optional[int] = None
    title: str
    genre: str
    artist: str
    artist_description: Optional[str] = None
    introduction: str
    schedule_date: Optional[str] = None
    schedule_time: Optional[str] = None
    director: Optional[str] = None
    cast: Optional[str] = None
    duration: Optional[str] = None
    tour_size: Optional[int] = None
    performers_count: Optional[int] = None
    staff_count: Optional[int] = None
    contact_names: Optional[str] = None
    contact_emails: Optional[str] = None
    venue: Optional[str] = None
    review: Optional[str] = None
    embedding: Optional[List[float]] = None

class BookerProfile(BaseModel):
    id: Optional[int] = None
    name: str
    preferred_genres: List[str]
    preferred_duration_min: Optional[int] = None  # in minutes
    preferred_duration_max: Optional[int] = None
    preferred_tour_size_min: Optional[int] = None
    preferred_tour_size_max: Optional[int] = None
    preferred_venues: Optional[List[str]] = None
    venue_type: Optional[str] = None
    target_audience: Optional[str] = None
    themes_of_interest: Optional[List[str]] = None

class MatchingRequest(BaseModel):
    booker_profile: BookerProfile
    top_k: int = 10

class SimilarityRequest(BaseModel):
    showcase_id: int
    top_k: int = 5

class MatchingResult(BaseModel):
    showcase: Showcase
    similarity_score: float
    venue_fit_score: Optional[float] = None
    
class VenueFitScore(BaseModel):
    showcase_id: int
    venue: str
    tour_size_fit: float  # 0-1 score
    duration_fit: float   # 0-1 score
    overall_score: float  # 0-1 score