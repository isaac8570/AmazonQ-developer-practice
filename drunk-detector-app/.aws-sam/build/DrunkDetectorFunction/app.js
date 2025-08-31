// AWS API Gateway 엔드포인트
const API_ENDPOINT = 'https://z9dopyfued.execute-api.us-east-1.amazonaws.com/Prod/analyze';

let video, canvas, ctx;
let currentResult = null;

// 카메라 초기화
async function initCamera() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 640 }
            } 
        });
        video.srcObject = stream;
    } catch (err) {
        alert('카메라 접근 권한이 필요합니다!');
        console.error('Camera error:', err);
    }
}

// 사진 캡처 및 분석
async function capturePhoto() {
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    
    // 캔버스에 현재 비디오 프레임 그리기
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    // 이미지를 base64로 변환
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    loading.style.display = 'block';
    result.style.display = 'none';
    
    try {
        // AWS Lambda 함수 호출
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageData.split(',')[1] // base64 데이터만 전송
            })
        });
        
        const data = await response.json();
        displayResult(data);
        
    } catch (error) {
        console.error('Analysis error:', error);
        // 데모용 랜덤 결과
        displayResult({
            drunkScore: Math.floor(Math.random() * 100),
            confidence: Math.floor(Math.random() * 30) + 70,
            features: {
                eyeAspectRatio: Math.random(),
                faceSymmetry: Math.random(),
                emotionConfidence: Math.random()
            }
        });
    }
    
    loading.style.display = 'none';
}

// 결과 표시
function displayResult(data) {
    const result = document.getElementById('result');
    const score = document.getElementById('score');
    const message = document.getElementById('message');
    const shareBtn = document.getElementById('shareBtn');
    
    currentResult = data;
    
    score.textContent = `${data.drunkScore}%`;
    
    let messageText = '';
    if (data.drunkScore < 30) {
        messageText = '😊 아직 멀쩡하네요!';
        score.style.color = '#27ae60';
    } else if (data.drunkScore < 60) {
        messageText = '🤔 조금 취한 것 같은데요?';
        score.style.color = '#f39c12';
    } else {
        messageText = '🚨 많이 취하셨네요! 대리운전 부르세요!';
        score.style.color = '#e74c3c';
    }
    
    message.textContent = messageText;
    result.style.display = 'block';
    shareBtn.style.display = 'block';
}

// 결과 공유
function shareResult() {
    if (!currentResult) return;
    
    const shareText = `술친구 AI 측정 결과: ${currentResult.drunkScore}% 취함! 🍺`;
    
    if (navigator.share) {
        navigator.share({
            title: '술친구 AI',
            text: shareText,
            url: window.location.href
        });
    } else {
        // 클립보드에 복사
        navigator.clipboard.writeText(shareText).then(() => {
            alert('결과가 클립보드에 복사되었습니다!');
        });
    }
}

// 페이지 로드시 카메라 초기화
window.addEventListener('load', initCamera);
