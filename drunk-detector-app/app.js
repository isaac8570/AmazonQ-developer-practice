// AWS API Gateway 엔드포인트
const API_ENDPOINT = 'https://z9dopyfued.execute-api.us-east-1.amazonaws.com/Prod/analyze';

let video, canvas, ctx;
let currentResult = null;

// 페이지 로드 시 파티클 효과 시작
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    initCamera();
});

// 파티클 효과 생성
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    
    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
        
        // 애니메이션 완료 후 제거
        setTimeout(() => {
            particle.remove();
        }, 6000);
    }, 300);
}

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
    const emoji = document.getElementById('emoji');
    const shareBtn = document.getElementById('shareBtn');
    const kakaoBtn = document.getElementById('kakaoBtn');
    
    currentResult = data;
    
    // 점수 애니메이션
    animateScore(0, data.drunkScore, score);
    
    // 취한 정도별 이모지와 메시지
    const responses = getResponseByLevel(data.drunkScore);
    emoji.textContent = responses.emoji;
    message.innerHTML = responses.message; // innerHTML로 변경해서 <br> 태그 적용
    
    result.style.display = 'block';
    shareBtn.style.display = 'block';
    kakaoBtn.style.display = 'block'; // 항상 표시
}

// 점수 카운트업 애니메이션
function animateScore(start, end, element) {
    const duration = 2000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current + '%';
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// 취한 정도별 응답 메시지
function getResponseByLevel(level) {
    if (level < 20) {
        return {
            emoji: '😇',
            message: '완전 멀쩡하네요! 더 마셔도 될 것 같은데? 🍻'
        };
    } else if (level < 40) {
        return {
            emoji: '😊',
            message: '살짝 기분 좋은 상태! 적당히 즐기고 계시네요 ✨'
        };
    } else if (level < 60) {
        return {
            emoji: '😵‍💫',
            message: '어? 조금 취하신 것 같은데요? 물 좀 마셔요! 💧<br><strong>대리운전이 필요하다면? 👇</strong>'
        };
    } else if (level < 80) {
        return {
            emoji: '🥴',
            message: '많이 취하셨네요! 집에 갈 준비 하세요 🏠<br><strong>대리운전이 필요하다면? 👇</strong>'
        };
    } else {
        return {
            emoji: '🤢',
            message: '완전 취했어요! 절대 운전하지 마세요! 🚫<br><strong>대리운전이 필요하다면? 👇</strong>'
        };
    }
}

// 결과 공유
function shareResult() {
    if (!currentResult) return;
    
    const shareText = `🍺 나의 술취함 정도: ${currentResult.drunkScore}%

당신의 술취함 정도도 테스트해보세요! 
AI가 얼굴을 분석해서 취한 정도를 측정해드려요 🤖

👉 https://d3tx5tv4w3uf1p.cloudfront.net`;
    
    // 클립보드에 바로 복사
    navigator.clipboard.writeText(shareText).then(() => {
        alert('📋 공유 메시지가 클립보드에 복사되었습니다!\n카톡이나 SNS에 붙여넣기 하세요!');
    }).catch(() => {
        // 복사 실패시 텍스트 선택
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('📋 공유 메시지가 복사되었습니다!');
    });
}

// 카카오T 대리운전 호출
function callKakaoT() {
    const kakaoTUrl = 'kakaot://proxy';
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const fallbackUrl = isIOS 
        ? 'https://apps.apple.com/kr/app/kakaot/id981110422'
        : 'https://play.google.com/store/apps/details?id=com.kakao.taxi';
    
    try {
        window.location.href = kakaoTUrl;
        setTimeout(() => {
            if (!document.hidden) {
                window.open(fallbackUrl, '_blank');
            }
        }, 2000);
    } catch (error) {
        window.open(fallbackUrl, '_blank');
    }
}

// 페이지 로드시 카메라 초기화
window.addEventListener('load', initCamera);
