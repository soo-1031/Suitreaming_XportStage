import sqlite3
import pandas as pd
from typing import List, Optional
import json
from models import Showcase

class Database:
    def __init__(self, db_path: str = "showcases.db"):
        self.db_path = db_path
        self.init_db()
    
    def init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS showcases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                genre TEXT,
                artist TEXT,
                artist_description TEXT,
                introduction TEXT,
                schedule_date TEXT,
                schedule_time TEXT,
                director TEXT,
                cast TEXT,
                duration TEXT,
                tour_size INTEGER,
                performers_count INTEGER,
                staff_count INTEGER,
                contact_names TEXT,
                contact_emails TEXT,
                venue TEXT,
                review TEXT,
                embedding TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS booker_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                preferred_genres TEXT,
                preferred_duration_min INTEGER,
                preferred_duration_max INTEGER,
                preferred_tour_size_min INTEGER,
                preferred_tour_size_max INTEGER,
                preferred_venues TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def load_from_csv(self, csv_path: str):
        """Load PAMS.csv data into database"""
        df = pd.read_csv(csv_path)
        
        conn = sqlite3.connect(self.db_path)
        
        # Clean column names
        df.columns = [col.lower().replace(' ', '_').replace('(', '').replace(')', '') for col in df.columns]
        
        # Parse tour_size, performers_count, staff_count from data
        for col in ['tour_size', 'performers_count', 'staff_count']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Save to database
        df.to_sql('showcases', conn, if_exists='replace', index=False)
        conn.close()
    
    def get_all_showcases(self) -> List[Showcase]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT rowid, * FROM showcases")
        rows = cursor.fetchall()
        
        showcases = []
        for row in rows:
            # Handle different column names from PAMS.csv
            showcase_dict = {
                'id': row[0],  # rowid
                'title': row[1] if len(row) > 1 else None,
                'genre': row[2] if len(row) > 2 else None,
                'artist': row[3] if len(row) > 3 else None,
                'artist_description': row[4] if len(row) > 4 else None,
                'introduction': row[5] if len(row) > 5 else None,  # introduction_to_the_work
                'schedule_date': row[6] if len(row) > 6 else None,
                'schedule_time': row[7] if len(row) > 7 else None,
                'director': row[8] if len(row) > 8 else None,
                'cast': row[9] if len(row) > 9 else None,
                'duration': row[10] if len(row) > 10 else None,  # durationfull-length
                'tour_size': row[11] if len(row) > 11 else None,
                'performers_count': row[12] if len(row) > 12 else None,
                'staff_count': row[13] if len(row) > 13 else None,
                'contact_names': row[14] if len(row) > 14 else None,
                'contact_emails': row[15] if len(row) > 15 else None,
                'venue': row[16] if len(row) > 16 else None,  # pams_venue
                'review': row[17] if len(row) > 17 else None,
                'embedding': None  # Will be handled separately
            }
            showcases.append(Showcase(**showcase_dict))
        
        conn.close()
        return showcases
    
    def get_showcase_by_id(self, showcase_id: int) -> Optional[Showcase]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT rowid, * FROM showcases WHERE rowid = ?", (showcase_id,))
        row = cursor.fetchone()
        
        if row:
            # Handle different column names from PAMS.csv
            showcase_dict = {
                'id': row[0],  # rowid
                'title': row[1] if len(row) > 1 else None,
                'genre': row[2] if len(row) > 2 else None,
                'artist': row[3] if len(row) > 3 else None,
                'artist_description': row[4] if len(row) > 4 else None,
                'introduction': row[5] if len(row) > 5 else None,  # introduction_to_the_work
                'schedule_date': row[6] if len(row) > 6 else None,
                'schedule_time': row[7] if len(row) > 7 else None,
                'director': row[8] if len(row) > 8 else None,
                'cast': row[9] if len(row) > 9 else None,
                'duration': row[10] if len(row) > 10 else None,  # durationfull-length
                'tour_size': row[11] if len(row) > 11 else None,
                'performers_count': row[12] if len(row) > 12 else None,
                'staff_count': row[13] if len(row) > 13 else None,
                'contact_names': row[14] if len(row) > 14 else None,
                'contact_emails': row[15] if len(row) > 15 else None,
                'venue': row[16] if len(row) > 16 else None,  # pams_venue
                'review': row[17] if len(row) > 17 else None,
                'embedding': None  # Will be handled separately
            }
            conn.close()
            return Showcase(**showcase_dict)
        
        conn.close()
        return None
    
    def update_embedding(self, showcase_id: int, embedding: List[float]):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        embedding_json = json.dumps(embedding)
        cursor.execute(
            "UPDATE showcases SET embedding = ? WHERE id = ?",
            (embedding_json, showcase_id)
        )
        
        conn.commit()
        conn.close()
# Trigger reload
