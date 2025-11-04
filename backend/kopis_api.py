import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from typing import Dict, Optional

class KOPISClient:
    def __init__(self, service_key: str):
        self.service_key = service_key
        self.base_url = "http://kopis.or.kr/openApi/restful"

    def get_genre_stats(self, days_back: int = 31) -> Dict[str, float]:
        """
        KOPIS API를 통해 장르별 통계를 가져와서 장르지수를 계산합니다.

        Args:
            days_back: 조회할 기간 (일 단위, 최대 31일)

        Returns:
            Dict[str, float]: 장르별 지수 (0.0 ~ 1.0)
        """
        # 날짜 계산 (최대 31일)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=min(days_back, 31))

        stdate = start_date.strftime("%Y%m%d")
        eddate = end_date.strftime("%Y%m%d")

        # API 요청
        url = f"{self.base_url}/boxStatsCate"
        params = {
            'service': self.service_key,
            'stdate': stdate,
            'eddate': eddate
        }

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            # XML 파싱
            root = ET.fromstring(response.content)

            # 장르별 데이터 추출
            genre_data = {}
            total_audience = 0

            for box_stats in root.findall('boxStatsof'):
                catenm = box_stats.find('catenm')
                ntssnmrssm = box_stats.find('ntssnmrssm')

                if catenm is not None and ntssnmrssm is not None:
                    genre_name = catenm.text.strip() if catenm.text else ""
                    audience_count = int(ntssnmrssm.text) if ntssnmrssm.text else 0

                    # 장르명 매핑
                    if genre_name and genre_name != "합계":
                        genre_data[genre_name] = audience_count
                        total_audience += audience_count

            # 장르지수 계산 (점유율)
            genre_indices = {}
            if total_audience > 0:
                for genre, audience in genre_data.items():
                    share = audience / total_audience
                    genre_indices[self._map_genre_name(genre)] = share

            # 기본값으로 보완 (API에서 데이터가 없는 경우)
            default_indices = {
                'dance': 0.60,
                'music': 0.75,
                'theater': 0.45,
                'musical': 0.70
            }

            for genre in default_indices:
                if genre not in genre_indices:
                    genre_indices[genre] = default_indices[genre]

            return genre_indices

        except Exception as e:
            print(f"KOPIS API 오류: {e}")
            # API 실패 시 기본값 반환
            return {
                'dance': 0.60,
                'music': 0.75,
                'theater': 0.45,
                'musical': 0.70
            }

    def _map_genre_name(self, kopis_genre: str) -> str:
        """KOPIS 장르명을 내부 장르 코드로 매핑"""
        mapping = {
            '무용': 'dance',
            '음악': 'music',
            '연극': 'theater',
            '뮤지컬': 'musical',
            '서양음악(클래식)': 'music',
            '한국음악(국악)': 'music',
            '대중음악': 'music',
            '복합': 'musical'  # 복합은 뮤지컬로 분류
        }
        return mapping.get(kopis_genre, 'theater')  # 기본값은 연극

# 전역 클라이언트 인스턴스
kopis_client = KOPISClient("9e9bc3ee73e34fa0b7faa7ff8b97d045")

def get_current_genre_indices() -> Dict[str, float]:
    """현재 장르지수를 가져오는 헬퍼 함수"""
    return kopis_client.get_genre_stats()