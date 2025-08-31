#!/bin/bash

# 술친구 AI 앱 배포 스크립트

echo "🍺 술친구 AI 배포 시작!"

# SAM 빌드 및 배포
echo "📦 Lambda 함수 배포 중..."
sam build
sam deploy --guided

# API Gateway URL 가져오기
API_URL=$(aws cloudformation describe-stacks --stack-name drunk-detector-app --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text)
echo "🔗 API URL: $API_URL"

# JavaScript 파일에 API URL 업데이트
sed -i "s|https://your-api-gateway-url.amazonaws.com/prod/analyze|$API_URL|g" app.js

# S3 버킷 이름 가져오기
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name drunk-detector-app --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' --output text)
echo "🪣 S3 Bucket: $BUCKET_NAME"

# 웹사이트 파일들 S3에 업로드
echo "📤 웹사이트 파일 업로드 중..."
aws s3 cp index.html s3://$BUCKET_NAME/
aws s3 cp app.js s3://$BUCKET_NAME/

# CloudFront URL 가져오기
CLOUDFRONT_URL=$(aws cloudformation describe-stacks --stack-name drunk-detector-app --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' --output text)

echo "🎉 배포 완료!"
echo "🌐 웹사이트 URL: https://$CLOUDFRONT_URL"
echo ""
echo "📱 모바일에서 접속해서 테스트해보세요!"
