import json
import boto3
import base64
from decimal import Decimal

rekognition = boto3.client('rekognition')

def lambda_handler(event, context):
    # GET 요청 처리
    if event['httpMethod'] == 'GET':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'message': 'Drunk Detector API is running!',
                'usage': 'POST /analyze with base64 image data'
            })
        }
    
    # POST 요청 처리
    try:
        # JSON 파싱
        if isinstance(event['body'], str):
            body = json.loads(event['body'])
        else:
            body = event['body']
            
        # 이미지 데이터 디코딩
        image_data = base64.b64decode(body['image'])
        
        # Rekognition으로 얼굴 분석
        response = rekognition.detect_faces(
            Image={'Bytes': image_data},
            Attributes=['ALL']
        )
        
        if not response['FaceDetails']:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'error': '얼굴을 찾을 수 없습니다'})
            }
        
        face = response['FaceDetails'][0]
        
        # 취한 정도 계산 알고리즘
        drunk_score = calculate_drunk_score(face)
        
        result = {
            'drunkScore': drunk_score,
            'confidence': float(face['Confidence']),
            'features': {
                'eyesOpen': face['EyesOpen']['Value'],
                'eyesOpenConfidence': float(face['EyesOpen']['Confidence']),
                'mouthOpen': face['MouthOpen']['Value'],
                'mouthOpenConfidence': float(face['MouthOpen']['Confidence']),
                'emotions': [
                    {
                        'type': emotion['Type'],
                        'confidence': float(emotion['Confidence'])
                    } for emotion in face['Emotions'][:3]
                ]
            }
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps(result)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': str(e)})
        }

def calculate_drunk_score(face):
    """간단한 취한 정도 계산 알고리즘"""
    score = 0
    
    # 눈이 감겨있으면 점수 증가
    if not face['EyesOpen']['Value']:
        score += 30
    elif face['EyesOpen']['Confidence'] < 80:
        score += 15
    
    # 입이 벌어져 있으면 점수 증가
    if face['MouthOpen']['Value']:
        score += 20
    
    # 감정 분석 - 혼란스러운 감정이면 점수 증가
    for emotion in face['Emotions']:
        if emotion['Type'] in ['CONFUSED', 'DISGUSTED'] and emotion['Confidence'] > 50:
            score += 25
        elif emotion['Type'] == 'HAPPY' and emotion['Confidence'] > 80:
            score += 10  # 너무 행복해도 의심스러움
    
    # 얼굴 기울기 체크
    pose = face['Pose']
    if abs(pose['Roll']) > 10:  # 머리가 10도 이상 기울어짐
        score += 15
    
    return min(score, 100)  # 최대 100점
