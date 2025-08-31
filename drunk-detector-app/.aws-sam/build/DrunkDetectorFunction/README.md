# 🍺 술친구 AI - 취한 정도 측정 앱

Amazon Rekognition을 활용한 재미있는 해커톤 프로젝트!

## 🚀 기능

- 📸 실시간 얼굴 인식으로 취한 정도 측정
- 🤖 AWS Rekognition 기반 AI 분석
- 📱 모바일 최적화된 PWA
- 📊 0-100% 점수화 시스템
- 📤 결과 공유 기능

## 🏗️ AWS 아키텍처

- **프론트엔드**: S3 + CloudFront
- **백엔드**: API Gateway + Lambda
- **AI**: Amazon Rekognition
- **배포**: SAM (Serverless Application Model)

## 📋 사전 요구사항

```bash
# AWS CLI 설치 및 설정
aws configure

# SAM CLI 설치
pip install aws-sam-cli
```

## 🛠️ 배포 방법

```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd drunk-detector-app

# 2. 배포 실행
./deploy.sh
```

## 🧠 AI 분석 로직

취한 정도는 다음 요소들로 계산됩니다:

- 👁️ 눈의 열림/감김 상태
- 👄 입의 벌어짐 정도  
- 😵 얼굴 기울기 (Roll)
- 😕 감정 상태 (혼란, 행복 과다 등)

## 📱 사용법

1. 웹사이트 접속
2. 카메라 권한 허용
3. "측정하기" 버튼 클릭
4. AI 분석 결과 확인
5. 친구들과 결과 공유!

## ⚠️ 주의사항

이 앱은 **재미 목적**으로만 사용하세요!
실제 음주 측정이나 의학적 진단 용도가 아닙니다.

## 🎯 해커톤 확장 아이디어

- 🚗 대리운전 API 연동
- 👥 친구들과 점수 비교 기능
- 📈 시간별 취한 정도 그래프
- 🔒 취한 상태에서 앱 사용 제한
- 🎮 게임 모드 추가
