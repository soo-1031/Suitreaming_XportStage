import numpy as np
from typing import List, Tuple
from sklearn.metrics.pairwise import cosine_similarity
from models import Showcase, BookerProfile, MatchingResult, VenueFitScore

class MatchingService:
    def __init__(self):
        self.venue_capacity_map = {
            "Daloreum Theater, National Theater of Korea": 450,
            "Haneul Round Theater, National Theater of Korea": 627,
            "Seoul Namsan Gugakdang": 300,
            "Daehakro Arts Theater-Main Hall": 600,
            "Arko Arts Theater-Small Hall": 150,
            "SFAC Theater QUAD": 200,
            "Lee O‑young Art Theater": 250,
            "TINC(This Is Not a Church)": 100,
            "Daehakro Arts Theater Small Theater": 150
        }
    
    def calculate_cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        if not vec1 or not vec2:
            return 0.0
        
        vec1_np = np.array(vec1).reshape(1, -1)
        vec2_np = np.array(vec2).reshape(1, -1)
        
        similarity = cosine_similarity(vec1_np, vec2_np)[0][0]
        return float(similarity)
    
    def find_similar_showcases(
        self, 
        target_showcase: Showcase, 
        all_showcases: List[Showcase], 
        top_k: int = 5
    ) -> List[MatchingResult]:
        """Find similar showcases based on embedding similarity"""
        if not target_showcase.embedding:
            return []
        
        results = []
        for showcase in all_showcases:
            if showcase.id == target_showcase.id:
                continue
            
            if showcase.embedding:
                similarity = self.calculate_cosine_similarity(
                    target_showcase.embedding, 
                    showcase.embedding
                )
                results.append(MatchingResult(
                    showcase=showcase,
                    similarity_score=similarity
                ))
        
        # Sort by similarity score
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        return results[:top_k]
    
    def calculate_venue_fit(self, showcase: Showcase, venue: str = None) -> VenueFitScore:
        """Calculate how well a showcase fits a venue"""
        if not venue:
            venue = showcase.venue
        
        venue_capacity = self.venue_capacity_map.get(venue, 300)  # Default capacity
        
        # Tour size fit (ideal tour size vs venue capacity ratio)
        tour_size_fit = 1.0
        if showcase.tour_size:
            # Ideal ratio is tour_size * 30 = venue_capacity (rough estimate)
            ideal_capacity = showcase.tour_size * 30
            ratio = min(venue_capacity, ideal_capacity) / max(venue_capacity, ideal_capacity)
            tour_size_fit = ratio
        
        # Duration fit (shorter shows for smaller venues)
        duration_fit = 1.0
        if showcase.duration:
            # Extract minutes from duration string
            try:
                duration_min = int(''.join(filter(str.isdigit, showcase.duration.split('min')[0])))
                if venue_capacity < 200:  # Small venue
                    duration_fit = 1.0 if duration_min <= 60 else 0.7
                elif venue_capacity < 400:  # Medium venue
                    duration_fit = 1.0 if duration_min <= 90 else 0.8
                else:  # Large venue
                    duration_fit = 1.0  # Any duration is fine
            except:
                duration_fit = 0.8
        
        overall_score = (tour_size_fit * 0.6 + duration_fit * 0.4)
        
        return VenueFitScore(
            showcase_id=showcase.id,
            venue=venue,
            tour_size_fit=tour_size_fit,
            duration_fit=duration_fit,
            overall_score=overall_score
        )
    
    def match_showcases_to_booker(
        self,
        booker_profile: BookerProfile,
        all_showcases: List[Showcase],
        top_k: int = 10
    ) -> List[MatchingResult]:
        """Match showcases to a booker's profile"""
        results = []
        
        for showcase in all_showcases:
            score = 0.0
            match_count = 0
            
            # Genre matching
            if booker_profile.preferred_genres and showcase.genre:
                genre_parts = showcase.genre.lower().split(',')
                for genre in genre_parts:
                    genre = genre.strip()
                    if any(pref.lower() in genre for pref in booker_profile.preferred_genres):
                        score += 0.3
                        match_count += 1
                        break
            
            # Duration matching
            if booker_profile.preferred_duration_min and showcase.duration:
                try:
                    duration_min = int(''.join(filter(str.isdigit, showcase.duration.split('min')[0])))
                    if booker_profile.preferred_duration_min <= duration_min <= (booker_profile.preferred_duration_max or 999):
                        score += 0.2
                        match_count += 1
                except:
                    pass
            
            # Tour size matching
            if booker_profile.preferred_tour_size_min and showcase.tour_size:
                if booker_profile.preferred_tour_size_min <= showcase.tour_size <= (booker_profile.preferred_tour_size_max or 999):
                    score += 0.2
                    match_count += 1
            
            # Venue matching
            if booker_profile.preferred_venues and showcase.venue:
                if any(venue in showcase.venue for venue in booker_profile.preferred_venues):
                    score += 0.1
                    match_count += 1
            
            # Calculate venue fit
            venue_fit = self.calculate_venue_fit(showcase)
            score += venue_fit.overall_score * 0.2
            
            # Normalize score
            if match_count > 0:
                normalized_score = score / (match_count * 0.3 + 0.7)
            else:
                normalized_score = venue_fit.overall_score * 0.2
            
            results.append(MatchingResult(
                showcase=showcase,
                similarity_score=normalized_score,
                venue_fit_score=venue_fit.overall_score
            ))
        
        # Sort by score
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        return results[:top_k]
    
    def get_booker_recommendations(
        self,
        booker_profile: BookerProfile,
        all_showcases: List[Showcase],
        embedding_weight: float = 0.5,
        profile_weight: float = 0.5,
        top_k: int = 10
    ) -> List[MatchingResult]:
        """Get hybrid recommendations combining content similarity and profile matching"""
        # Get profile-based matches
        profile_matches = self.match_showcases_to_booker(booker_profile, all_showcases, len(all_showcases))
        
        # Create a score map
        final_scores = {}
        for match in profile_matches:
            final_scores[match.showcase.id] = {
                'showcase': match.showcase,
                'profile_score': match.similarity_score,
                'venue_fit': match.venue_fit_score,
                'embedding_score': 0.0
            }
        
        # If we have embeddings, add content similarity scores
        # (In a real scenario, we'd have a reference showcase or booker history)
        # For now, we'll just use profile scores
        
        # Combine scores
        results = []
        for showcase_id, scores in final_scores.items():
            combined_score = (
                scores['profile_score'] * profile_weight +
                scores['embedding_score'] * embedding_weight
            )
            results.append(MatchingResult(
                showcase=scores['showcase'],
                similarity_score=combined_score,
                venue_fit_score=scores['venue_fit']
            ))
        
        results.sort(key=lambda x: x.similarity_score, reverse=True)
        return results[:top_k]