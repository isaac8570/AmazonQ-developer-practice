// 공통 유틸리티 함수들

// 도메인별 신뢰도 계산
function calculateCredibility(domain) {
    const highCredibility = [
        'yonhapnews.co.kr', 'yna.co.kr', 'kbs.co.kr', 'mbc.co.kr', 'sbs.co.kr',
        'chosun.com', 'donga.com', 'joongang.co.kr', 'hani.co.kr', 'khan.co.kr',
        'bbc.com', 'cnn.com', 'reuters.com', 'ap.org', 'nytimes.com'
    ];
    
    const mediumCredibility = [
        'naver.com', 'daum.net', 'mk.co.kr', 'mt.co.kr', 'etnews.com',
        'newsis.com', 'news1.kr', 'edaily.co.kr'
    ];
    
    if (highCredibility.some(trusted => domain.includes(trusted))) {
        return 'High';
    } else if (mediumCredibility.some(medium => domain.includes(medium))) {
        return 'Medium';
    } else {
        return 'Low';
    }
}

// 신뢰도 점수 계산
function calculateOverallCredibility(sources) {
    if (sources.length === 0) return 0;
    
    const scores = sources.map(source => {
        switch(source.credibility) {
            case 'High': return 90;
            case 'Medium': return 60;
            case 'Low': return 30;
            default: return 30;
        }
    });
    
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // 출처 다양성 보너스
    const uniqueDomains = new Set(sources.map(s => s.domain)).size;
    const diversityBonus = Math.min(uniqueDomains * 5, 20);
    
    return Math.min(Math.round(average + diversityBonus), 100);
}

// 분석 결과 생성
function generateAnalysis(sources, credibilityScore) {
    const highCredSources = sources.filter(s => s.credibility === 'High').length;
    const totalSources = sources.length;
    
    let verificationStatus;
    let consensus;
    
    if (credibilityScore >= 80) {
        verificationStatus = '검증됨';
        consensus = '다수의 신뢰할 수 있는 출처에서 일관된 정보를 확인했습니다.';
    } else if (credibilityScore >= 60) {
        verificationStatus = '부분 검증됨';
        consensus = '일부 신뢰할 수 있는 출처에서 정보를 확인했으나 추가 검증이 필요합니다.';
    } else if (credibilityScore >= 40) {
        verificationStatus = '검증 필요';
        consensus = '제한적인 출처에서만 정보를 확인했습니다. 신중한 판단이 필요합니다.';
    } else {
        verificationStatus = '검증 불가';
        consensus = '신뢰할 수 있는 출처에서 정보를 확인하지 못했습니다.';
    }
    
    return {
        verificationStatus,
        consensus,
        conflictingInfo: totalSources > 2 && highCredSources < totalSources * 0.6
    };
}

module.exports = {
    calculateCredibility,
    calculateOverallCredibility,
    generateAnalysis
};