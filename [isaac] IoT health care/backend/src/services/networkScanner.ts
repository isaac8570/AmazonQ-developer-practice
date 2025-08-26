import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface NetworkScanResult {
  manufacturer?: string;
  model?: string;
  macAddress?: string;
  openPorts: number[];
  httpTitle?: string;
  sshBanner?: string;
}

export class NetworkScanner {
  
  /**
   * 실제 네트워크 스캔을 통한 기기 정보 수집
   */
  async scanDevice(ip: string): Promise<NetworkScanResult> {
    const result: NetworkScanResult = {
      openPorts: []
    };

    try {
      // 1. 기본 포트 스캔 (일반적인 공유기 포트들)
      const commonPorts = [22, 23, 53, 80, 443, 8080, 8443, 9000];
      result.openPorts = await this.scanPorts(ip, commonPorts);

      // 2. HTTP 제목 가져오기 (웹 인터페이스가 있는 경우)
      if (result.openPorts.includes(80)) {
        result.httpTitle = await this.getHttpTitle(ip, 80);
      } else if (result.openPorts.includes(8080)) {
        result.httpTitle = await this.getHttpTitle(ip, 8080);
      }

      // 3. MAC 주소 및 제조사 정보 (ARP 테이블 이용)
      const macInfo = await this.getMacAddress(ip);
      if (macInfo) {
        result.macAddress = macInfo.mac;
        result.manufacturer = macInfo.manufacturer;
      }

      // 4. SSH 배너 정보 (있는 경우)
      if (result.openPorts.includes(22)) {
        result.sshBanner = await this.getSshBanner(ip);
      }

      // 5. HTTP 제목이나 기타 정보로 모델 추정
      result.model = this.estimateModel(result);

    } catch (error) {
      console.error(`네트워크 스캔 오류 (${ip}):`, error);
    }

    return result;
  }

  /**
   * 포트 스캔
   */
  private async scanPorts(ip: string, ports: number[]): Promise<number[]> {
    const openPorts: number[] = [];
    
    for (const port of ports) {
      try {
        // 간단한 TCP 연결 테스트
        const { stdout } = await execAsync(`timeout 3 bash -c "echo >/dev/tcp/${ip}/${port}" 2>/dev/null && echo "open" || echo "closed"`);
        if (stdout.trim() === 'open') {
          openPorts.push(port);
        }
      } catch (error) {
        // 포트가 닫혀있거나 접근 불가
      }
    }

    return openPorts;
  }

  /**
   * HTTP 제목 가져오기
   */
  private async getHttpTitle(ip: string, port: number): Promise<string | undefined> {
    try {
      const { stdout } = await execAsync(`curl -s --connect-timeout 5 --max-time 10 http://${ip}:${port} | grep -i '<title>' | sed 's/<[^>]*>//g' | head -1`);
      return stdout.trim() || undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * MAC 주소 및 제조사 정보 가져오기
   */
  private async getMacAddress(ip: string): Promise<{mac: string, manufacturer?: string} | undefined> {
    try {
      // ARP 테이블에서 MAC 주소 찾기
      const { stdout } = await execAsync(`arp -n ${ip} 2>/dev/null | grep -E "([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}" | awk '{print $3}'`);
      const mac = stdout.trim();
      
      if (mac) {
        const manufacturer = this.getMacManufacturer(mac);
        return { mac, manufacturer };
      }
    } catch (error) {
      // ARP 테이블에 없거나 오류
    }
    
    return undefined;
  }

  /**
   * SSH 배너 정보 가져오기
   */
  private async getSshBanner(ip: string): Promise<string | undefined> {
    try {
      const { stdout } = await execAsync(`timeout 5 ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no ${ip} 2>&1 | head -1`);
      return stdout.trim() || undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * MAC 주소로 제조사 추정
   */
  private getMacManufacturer(mac: string): string | undefined {
    const oui = mac.substring(0, 8).toUpperCase();
    
    const ouiDatabase: {[key: string]: string} = {
      '00:1E:2A': 'LG U+',
      '00:26:66': 'ipTIME',
      '88:36:6C': 'KT',
      '00:08:9F': 'SK Broadband',
      '50:C7:BF': 'TP-Link',
      '2C:56:DC': 'ASUS',
      '44:94:FC': 'Netgear',
      '13:10:47': 'Linksys',
      '00:23:69': 'ipTIME',
      '00:1D:AA': 'ipTIME'
    };

    return ouiDatabase[oui];
  }

  /**
   * 수집된 정보로 모델 추정
   */
  private estimateModel(scanResult: NetworkScanResult): string | undefined {
    const { httpTitle, manufacturer, openPorts } = scanResult;

    // HTTP 제목으로 모델 추정
    if (httpTitle) {
      if (httpTitle.includes('GW-HF611K') || httpTitle.includes('LG U+')) {
        return 'GW-HF611K';
      }
      if (httpTitle.includes('ipTIME')) {
        return 'A3004NS'; // 일반적인 ipTIME 모델
      }
      if (httpTitle.includes('Archer')) {
        return 'Archer C7';
      }
      if (httpTitle.includes('ASUS')) {
        return 'RT-AC68U';
      }
    }

    // 제조사 정보로 추정
    if (manufacturer) {
      switch (manufacturer) {
        case 'LG U+':
          return 'GW-HF611K';
        case 'ipTIME':
          return 'A3004NS';
        case 'KT':
          return 'GiGA WiFi home';
        case 'SK Broadband':
          return 'T-3200';
        case 'TP-Link':
          return 'Archer C7';
        case 'ASUS':
          return 'RT-AC68U';
        case 'Netgear':
          return 'R7000';
        case 'Linksys':
          return 'WRT3200ACM';
      }
    }

    return undefined;
  }
}
