import { useState, useEffect, useCallback } from 'react';

interface ClusterUpdate {
  type: 'new_article' | 'cluster_merge' | 'score_update';
  clusterId: string;
  data: any;
  timestamp: string;
}

interface NotificationSettings {
  threshold: number;
  sources: string[];
  keywords: string[];
}

export function useRealTimeUpdates(clusterId?: string) {
  const [updates, setUpdates] = useState<ClusterUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws');
    
    ws.onopen = () => {
      setIsConnected(true);
      // Subscribe to specific cluster if provided
      if (clusterId) {
        ws.send(JSON.stringify({
          type: 'subscribe',
          clusterId: clusterId
        }));
      }
    };

    ws.onmessage = (event) => {
      const update: ClusterUpdate = JSON.parse(event.data);
      
      setUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
      
      // Handle different update types
      switch (update.type) {
        case 'new_article':
          // Show notification for significant new articles
          if (update.data.traceScore > 0.7) {
            setNotifications(prev => [...prev, {
              id: Date.now(),
              type: 'high_score_article',
              message: `새로운 고신뢰도 기사: ${update.data.title}`,
              clusterId: update.clusterId,
              timestamp: update.timestamp
            }]);
          }
          break;
          
        case 'cluster_merge':
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'cluster_merge',
            message: `클러스터 병합: ${update.data.mergedCount}개 기사`,
            clusterId: update.clusterId,
            timestamp: update.timestamp
          }]);
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [clusterId]);

  const dismissNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const subscribeToCluster = useCallback((newClusterId: string) => {
    // Implementation would send subscription message to WebSocket
  }, []);

  return {
    updates,
    notifications,
    isConnected,
    dismissNotification,
    subscribeToCluster
  };
}

// Hook for managing watchlist and alert settings
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [alertSettings, setAlertSettings] = useState<NotificationSettings>({
    threshold: 0.7,
    sources: ['press', 'community'],
    keywords: []
  });

  const addToWatchlist = useCallback((clusterId: string) => {
    setWatchlist(prev => [...new Set([...prev, clusterId])]);
  }, []);

  const removeFromWatchlist = useCallback((clusterId: string) => {
    setWatchlist(prev => prev.filter(id => id !== clusterId));
  }, []);

  const updateAlertSettings = useCallback((settings: Partial<NotificationSettings>) => {
    setAlertSettings(prev => ({ ...prev, ...settings }));
  }, []);

  return {
    watchlist,
    alertSettings,
    addToWatchlist,
    removeFromWatchlist,
    updateAlertSettings
  };
}
