#!/usr/bin/env python3
"""
백엔드 연결 테스트 스크립트
"""

import requests
import json

def test_backend_connection():
    print("🔍 백엔드 연결 테스트 시작...")
    
    # 1. 기본 연결 테스트
    try:
        response = requests.get("http://localhost:8080/", timeout=5)
        print(f"✅ 기본 연결: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ 기본 연결 실패: {e}")
        return False
    
    # 2. 트렌딩 API 테스트
    try:
        response = requests.get("http://localhost:8080/trending", timeout=5)
        print(f"✅ 트렌딩 API: {response.status_code}")
        print(f"   데이터: {response.json()}")
    except Exception as e:
        print(f"❌ 트렌딩 API 실패: {e}")
    
    # 3. 검색 API 테스트
    try:
        test_data = {"query": "삼성전자", "sources": ["news"]}
        response = requests.post(
            "http://localhost:8080/search", 
            json=test_data,
            timeout=30
        )
        print(f"✅ 검색 API: {response.status_code}")
        result = response.json()
        print(f"   클러스터 수: {len(result.get('clusters', []))}")
        
        if result.get('clusters'):
            first_cluster = result['clusters'][0]
            print(f"   첫 번째 클러스터: {first_cluster.get('label', 'No label')}")
            print(f"   기사 수: {len(first_cluster.get('articles', []))}")
            
    except Exception as e:
        print(f"❌ 검색 API 실패: {e}")
    
    return True

if __name__ == "__main__":
    test_backend_connection()