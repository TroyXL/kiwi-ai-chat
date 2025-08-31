import { SCREENCAST_BASE_URL } from '@/lib/constants';
import React, { useEffect, useRef, useState } from 'react';

// --- Type Definitions ---

// Props for the component
interface BrowserTabViewProps {
  tabId: string;
}

// Possible states for the connection
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Structure of the message received from the gateway
interface ScreencastMessage {
  type: 'frame';
  data: string; // Base64 encoded image data
}

// --- Component Implementation ---

const BrowserTabView: React.FC<BrowserTabViewProps> = ({ tabId }) => {
  const [frame, setFrame] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!tabId) {
      setStatus('error');
      console.error("BrowserTabView: 'tabId' and 'domain' props are required.");
      return;
    }

    const url = `${SCREENCAST_BASE_URL}?tabId=${tabId}`;
    
    ws.current = new WebSocket(url);
    setStatus('connecting');

    ws.current.onopen = () => {
      console.log('Connected to screencast gateway.');
      setStatus('connected');
    };

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        const msg: ScreencastMessage = JSON.parse(event.data);
        if (msg.type === 'frame') {
          // Update the image source with the new base64 frame data
          setFrame(`data:image/jpeg;base64,${msg.data}`);
        }
      } catch (error) {
          // Ignore non-JSON messages
      }
    };

    ws.current.onerror = (event: Event) => {
      console.error('WebSocket error:', event);
      setStatus('error');
    };
    
    ws.current.onclose = (event: CloseEvent) => {
      console.log('WebSocket disconnected:', event.reason);
      setStatus('disconnected');
    };

    // Cleanup function on component unmount or prop change
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [tabId]); // Re-run effect if tabId or domain changes

  const renderStatus = () => {
    switch (status) {
      case 'connecting':
        return <div className="status-overlay">Connecting to session...</div>;
      case 'disconnected':
        return <div className="status-overlay error">Disconnected.</div>;
      case 'error':
        return <div className="status-overlay error">Connection Error.</div>;
      default:
        return null;
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>
      {renderStatus()}
      {frame ? (
        <img
          src={frame}
          alt="Browser Tab Stream"
          style={{ width: '100%', height: '100%', outline: 'none' }}
        />
      ) : (
        status === 'connected' && <div className="status-overlay">Waiting for first frame...</div>
      )}
    </div>
  );
};

export default BrowserTabView;