import { useRef, useEffect, useState } from 'react';
import { EditorState, Point } from '../types';

interface ImageCanvasProps {
  editorState: EditorState;
  onStateChange: (state: Partial<EditorState>) => void;
  image: HTMLImageElement | null;
  maskCanvas: HTMLCanvasElement | null;
}

export const ImageCanvas = ({ editorState, onStateChange, image, maskCanvas }: ImageCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState<Point | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !image) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();
    
    // Apply zoom and pan
    ctx.translate(pan.x, pan.y);
    ctx.scale(editorState.zoom, editorState.zoom);

    // Center image
    const x = (canvas.width / editorState.zoom - image.width) / 2;
    const y = (canvas.height / editorState.zoom - image.height) / 2;
    
    // Draw image
    ctx.drawImage(image, x, y);

    // Draw mask overlay if in brush/erase mode
    if (maskCanvas && (editorState.currentTool === 'brush' || editorState.currentTool === 'erase')) {
      ctx.globalAlpha = 0.5;
      ctx.drawImage(maskCanvas, x, y);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }, [image, editorState.zoom, editorState.currentTool, maskCanvas, pan]);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / editorState.zoom,
      y: (e.clientY - rect.top - pan.y) / editorState.zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    if (editorState.currentTool === 'pan') {
      setStartPan(point);
      onStateChange({ isDragging: true });
      return;
    }

    if (editorState.currentTool === 'brush' || editorState.currentTool === 'erase') {
      setIsDrawing(true);
      setLastPoint(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);

    if (editorState.currentTool === 'pan' && editorState.isDragging && startPan) {
      const dx = (e.clientX - (startPan.x * editorState.zoom + pan.x));
      const dy = (e.clientY - (startPan.y * editorState.zoom + pan.y));
      setPan({ x: pan.x + dx, y: pan.y + dy });
      return;
    }

    if (!isDrawing || !maskCanvas || !lastPoint || !image) return;

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    // Calculate image offset
    const canvas = canvasRef.current!;
    const offsetX = (canvas.width / editorState.zoom - image.width) / 2;
    const offsetY = (canvas.height / editorState.zoom - image.height) / 2;

    // Draw on mask
    ctx.strokeStyle = editorState.currentTool === 'brush' ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0)';
    ctx.lineWidth = editorState.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = editorState.currentTool === 'erase' ? 'destination-out' : 'source-over';

    ctx.beginPath();
    ctx.moveTo(lastPoint.x - offsetX, lastPoint.y - offsetY);
    ctx.lineTo(point.x - offsetX, point.y - offsetY);
    ctx.stroke();

    setLastPoint(point);

    // Force re-render
    onStateChange({ isDragging: true });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPoint(null);
    setStartPan(null);
    onStateChange({ isDragging: false });
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, editorState.zoom * delta));
    onStateChange({ zoom: newZoom });
  };

  return (
    <canvas
      ref={canvasRef}
      width={1200}
      height={800}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ 
        cursor: editorState.currentTool === 'pan' ? 'grab' : 
                editorState.currentTool === 'brush' || editorState.currentTool === 'erase' ? 'crosshair' : 
                'default',
        border: '2px solid #333',
        borderRadius: '8px',
        backgroundColor: '#1a1a1a'
      }}
    />
  );
};
