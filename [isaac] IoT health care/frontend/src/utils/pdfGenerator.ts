import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DiagnosticData } from '../types';

export class PDFGenerator {
  
  /**
   * 진단 결과를 PDF로 생성 (HTML to Canvas 방식으로 한글 지원)
   */
  static async generateDiagnosticReport(data: DiagnosticData): Promise<void> {
    try {
      // 임시 HTML 요소 생성
      const reportElement = this.createReportHTML(data);
      document.body.appendChild(reportElement);
      
      // HTML을 캔버스로 변환
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: 1200
      });
      
      // 임시 요소 제거
      document.body.removeChild(reportElement);
      
      // PDF 생성
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 210; // A4 width
      const pageHeight = 295; // A4 height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // 첫 페이지
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // 추가 페이지가 필요한 경우
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // PDF 다운로드
      const fileName = `IoT_건강진단서_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    }
  }

  /**
   * 리포트 HTML 요소 생성
   */
  private static createReportHTML(data: DiagnosticData): HTMLElement {
    const reportDiv = document.createElement('div');
    reportDiv.style.cssText = `
      width: 800px;
      padding: 40px;
      font-family: 'Malgun Gothic', '맑은 고딕', Arial, sans-serif;
      background: white;
      color: #333;
      line-height: 1.6;
      position: absolute;
      left: -9999px;
      top: 0;
    `;
    
    const riskColor = this.getRiskColor(data.riskLevel);
    const riskText = this.getRiskText(data.riskLevel);
    
    reportDiv.innerHTML = `
      <!-- 헤더 -->
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2980b9; padding-bottom: 20px;">
        <h1 style="color: #2980b9; font-size: 28px; margin: 0;">🏥 IoT Health Care</h1>
        <h2 style="color: #333; font-size: 20px; margin: 10px 0;">IoT 기기 보안 진단서</h2>
        <p style="color: #666; font-size: 14px; margin: 0;">진단일: ${new Date().toLocaleDateString('ko-KR')}</p>
      </div>

      <!-- 종합 평가 -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
        <h3 style="color: #333; margin-top: 0;">📊 종합 보안 점수</h3>
        <div style="font-size: 48px; font-weight: bold; color: ${riskColor}; margin: 10px 0;">
          ${data.overallScore}/100
        </div>
        <div style="font-size: 18px; font-weight: bold; color: ${riskColor}; padding: 8px 16px; background: white; border-radius: 20px; display: inline-block;">
          ${riskText}
        </div>
      </div>

      <!-- 기기 정보 -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #2980b9; border-bottom: 2px solid #2980b9; padding-bottom: 8px;">📱 기기 정보</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <p><strong>제조사:</strong> ${data.deviceInfo.manufacturer}</p>
          <p><strong>모델명:</strong> ${data.deviceInfo.model}</p>
          <p><strong>펌웨어 버전:</strong> ${data.deviceInfo.firmwareVersion}</p>
          <p><strong>MAC 주소:</strong> ${data.deviceInfo.macAddress}</p>
        </div>
      </div>

      <!-- 보안 검사 결과 -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #2980b9; border-bottom: 2px solid #2980b9; padding-bottom: 8px;">🔍 보안 검사 결과</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
          ${data.securityChecks.passwordStrength.admin > 0 ? 
            `<p><strong>관리자 비밀번호 강도:</strong> ${data.securityChecks.passwordStrength.admin}/100</p>` : 
            ''
          }
          <p><strong>WiFi 비밀번호 강도:</strong> ${data.securityChecks.passwordStrength.wifi}/100</p>
          <p><strong>열린 포트:</strong> ${data.securityChecks.openPorts.length > 0 ? data.securityChecks.openPorts.join(', ') : '없음'}</p>
          <p><strong>펌웨어 업데이트:</strong> ${data.securityChecks.firmwareUpdate ? '✅ 최신' : '❌ 업데이트 필요'}</p>
          <p><strong>WPS 상태:</strong> ${data.securityChecks.wpsEnabled ? '❌ 활성화됨' : '✅ 비활성화됨'}</p>
          <p><strong>원격 관리:</strong> ${data.securityChecks.remoteManagement ? '❌ 활성화됨' : '✅ 비활성화됨'}</p>
        </div>
      </div>

      <!-- 권장사항 -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #2980b9; border-bottom: 2px solid #2980b9; padding-bottom: 8px;">💡 보안 개선 권장사항</h3>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
          ${data.recommendations.map((rec, index) => 
            `<p style="margin: 8px 0;"><strong>${index + 1}.</strong> ${rec}</p>`
          ).join('')}
        </div>
      </div>

      <!-- 푸터 -->
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        <p>본 진단서는 IoT Health Care에서 생성되었습니다.</p>
        <p>정기적인 보안 점검을 통해 안전한 IoT 환경을 유지하세요.</p>
      </div>
    `;
    
    return reportDiv;
  }

  /**
   * 위험도별 색상 반환
   */
  private static getRiskColor(riskLevel: string): string {
    const colors = {
      excellent: '#27ae60',
      good: '#3498db', 
      warning: '#f39c12',
      danger: '#e74c3c'
    };
    return colors[riskLevel as keyof typeof colors] || '#333';
  }

  /**
   * 위험도별 텍스트 반환
   */
  private static getRiskText(riskLevel: string): string {
    const texts = {
      excellent: '🟢 매우 안전',
      good: '🔵 양호',
      warning: '🟡 주의 필요', 
      danger: '🔴 위험'
    };
    return texts[riskLevel as keyof typeof texts] || '알 수 없음';
  }
}
