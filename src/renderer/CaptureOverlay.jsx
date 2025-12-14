import { useState, useEffect, useRef } from 'react';
import './CaptureOverlay.css';

function CaptureOverlay() {
  const [screenshot, setScreenshot] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    loadScreenshot();
  }, []);

  const loadScreenshot = async () => {
    const imageData = await window.electronAPI.captureScreen();
    setScreenshot(imageData);
  };

  const getSelectionRect = () => {
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);
    return { x, y, width, height };
  };

  const handleMouseDown = (e) => {
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setIsSelecting(true);
  };

  const handleMouseMove = (e) => {
    if (!isSelecting) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
  };

  const captureSelection = () => {
    if (!screenshot) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const rect = getSelectionRect();

      // Seçim alanının boyutunu ayarla
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Seçili alanı kopyala
      ctx.drawImage(
        img,
        rect.x, rect.y, rect.width, rect.height,
        0, 0, rect.width, rect.height
      );

      const croppedImage = canvas.toDataURL('image/png');
      window.electronAPI.screenshotSelected(croppedImage);
    };

    img.src = screenshot;
  };

  const handleCancel = () => {
    window.electronAPI.cancelCapture();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !isSelecting && selectionRect.width > 0) {
      captureSelection();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelecting, screenshot, startPos, currentPos]);

  const selectionRect = getSelectionRect();

  return (
    <div className="capture-overlay" ref={overlayRef}>
      {screenshot && (
        <img
          src={screenshot}
          alt="Screen"
          className="screen-image"
          draggable={false}
        />
      )}

      <div
        className="selection-area"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {isSelecting && selectionRect.width > 0 && selectionRect.height > 0 && (
        <>
          <div
            className="selection-rect"
            style={{
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.width,
              height: selectionRect.height,
            }}
          />
          <div className="selection-info">
            {Math.round(selectionRect.width)} × {Math.round(selectionRect.height)}
          </div>
        </>
      )}

      {!isSelecting && selectionRect.width > 0 && selectionRect.height > 0 && (
        <>
          <div
            className="selection-rect confirmed"
            style={{
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.width,
              height: selectionRect.height,
            }}
          />
          <div className="capture-controls">
            <button className="control-btn primary" onClick={captureSelection}>
              Capture
            </button>
            <button className="control-btn" onClick={() => {
              setStartPos({ x: 0, y: 0 });
              setCurrentPos({ x: 0, y: 0 });
            }}>
              Reset
            </button>
            <button className="control-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CaptureOverlay;
