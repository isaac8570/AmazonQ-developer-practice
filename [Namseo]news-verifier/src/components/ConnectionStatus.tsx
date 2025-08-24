"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await api.testConnection();
      setIsConnected(connected);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // 10초마다 체크

    return () => clearInterval(interval);
  }, []);

  if (isConnected === null) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm">
        🔄 연결 확인 중...
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
        ❌ 백엔드 서버 연결 실패
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
      ✅ 백엔드 서버 연결됨
    </div>
  );
}