import { SCREENCAST_BASE_URL } from '@/lib/constants';
import React, { useEffect, useRef, useState, useCallback } from 'react';

// --- Type Definitions ---

// Props for the component
interface BrowserTabViewProps {
  tabId: string;
}

// Updated states to include 'reconnecting'
type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

// Structure of the message received from the gateway
interface ScreencastMessage {
  type: 'frame';
  data: string; // Base64 encoded image data
}

// --- Component Implementation ---

const BrowserTabView: React.FC<BrowserTabViewProps> = ({ tabId }) => {
  const [frame, setFrame] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const ws = useRef<WebSocket | null>(null);
  // Ref to hold the reconnect timer ID
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Encapsulate the connection logic in a useCallback to ensure a stable function reference
  const connect = useCallback(() => {
    if (!tabId) {
      setStatus('error');
      console.error("BrowserTabView: 'tabId' prop is required.");
      return;
    }

    // Don't try to connect if a connection is already open or connecting
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already open or connecting.');
      return;
    }

    const url = `${SCREENCAST_BASE_URL}?tabId=${tabId}`;
    ws.current = new WebSocket(url);

    // If it's the first attempt, status is 'connecting', otherwise 'reconnecting'
    setStatus(reconnectAttempt === 0 ? 'connecting' : 'reconnecting');

    ws.current.onopen = () => {
      console.log('Connected to screencast gateway.');
      setStatus('connected');
      setFrame(null); // Clear last frame on new connection
      setReconnectAttempt(0); // Reset reconnect attempts on successful connection
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current); // Clear any pending reconnect timers
      }
    };

    ws.current.onmessage = (event: MessageEvent) => {
      try {
        const msg: ScreencastMessage = JSON.parse(event.data);
        if (msg.type === 'frame') {
          setFrame(`data:image/jpeg;base64,${msg.data}`);
        }
      } catch (error) {
        // Ignore non-JSON messages
      }
    };

    ws.current.onerror = (event: Event) => {
      console.error('WebSocket error:', event);
      // The onclose event will usually be fired immediately after onerror
    };
    
    ws.current.onclose = (event: CloseEvent) => {
      console.log('WebSocket disconnected:', event.reason);

      // Don't attempt to reconnect if the component is unmounting (code 1000 is a normal closure)
      if (event.code === 1000) {
        setStatus('disconnected');
        return;
      }
      
      // --- Exponential Backoff Logic ---
      const nextAttempt = reconnectAttempt + 1;
      // Calculate delay: 1s, 2s, 4s, 8s, up to a max of 30s
      const delay = Math.min(30000, (2 ** reconnectAttempt) * 1000);
      
      console.log(`Will attempt to reconnect in ${delay / 1000} seconds...`);
      setStatus('reconnecting');
      setReconnectAttempt(nextAttempt);

      // Schedule the next reconnect attempt
      reconnectTimer.current = setTimeout(() => {
        connect();
      }, delay);
    };

  }, [tabId, reconnectAttempt]); // Rerun connect if tabId or the attempt count changes


  useEffect(() => {
    connect();

    // Cleanup function on component unmount
    return () => {
      // Clear any scheduled reconnects
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }

      // Cleanly close the WebSocket connection
      if (ws.current) {
        // We set onclose to null to prevent the reconnect logic from firing on a manual close
        ws.current.onclose = null; 
        ws.current.close(1000, "Component unmounting");
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId]); // Only re-trigger the initial connection when tabId changes

  const renderStatus = () => {
    switch (status) {
      case 'connecting':
        return <div className="status-overlay">Connecting to session...</div>;
      case 'reconnecting':
        return <div className="status-overlay">Connection lost. Reconnecting... (Attempt {reconnectAttempt})</div>;
      case 'disconnected':
        return <div className="status-overlay error">Disconnected.</div>;
      case 'error':
        return <div className="status-overlay error">Connection Error. Check tabId.</div>;
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