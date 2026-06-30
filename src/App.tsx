import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageCanvas } from './components/ImageCanvas';
import { Toolbar } from './components/Toolbar';
import { AIPanel, AIExecuteParams } from './components/AIPanel';
import { EditorState, HistoryState } from './types';
import { 
  loadImageFromFile, 
  createMaskCanvas, 
  imageToDataURL, 
  dataURLToImage,
  clearCanvas 
} from './utils/imageUtils';
import { aiService } from './utils/aiService';
import './App.css';

const initialState: EditorState = {
  currentTool: 'select',
  brushSize: 30,
  zoom: 1,
  isDragging: false,
  history: [],
  historyIndex: -1,
  isProcessing: false,
};

function App() {
  const [editorState, setEditorState] = useState<EditorState>(initialState);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Crear canvas de máscara cuando se carga una imagen
    if (image && !maskCanvas) {
      const mask = createMaskCanvas(image.width, image.height);
      setMaskCanvas(mask);
    }
  }, [image, maskCanvas]);

  const updateEditorState = useCallback((updates: Partial<EditorState>) => {
    setEditorState(prev => ({ ...prev, ...updates }));
  }, []);

  const addToHistory = useCallback((imageData: string) => {
    setEditorState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({
        imageData,
        timestamp: Date.now(),
      });

      // Limitar historial a 20 estados
      if (newHistory.length > 20) {
        newHistory.shift();
      }

      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const handleLoadImage = useCallback(async (file: File) => {
    try {
      const loadedImage = await loadImageFromFile(file);
      setImage(loadedImage);
      setMaskCanvas(null); // Reset mask
      setShowWelcome(false);

      // Agregar al historial
      const dataURL = imageToDataURL(loadedImage);
      addToHistory(dataURL);

      // Reset zoom
      updateEditorState({ zoom: 1 });
    } catch (error) {
      console.error('Error loading image:', error);
      alert('Error al cargar la imagen');
    }
  }, [addToHistory, updateEditorState]);

  const handleUndo = useCallback(async () => {
    if (editorState.historyIndex > 0) {
      const newIndex = editorState.historyIndex - 1;
      const historyState = editorState.history[newIndex];
      
      try {
        const img = await dataURLToImage(historyState.imageData);
        setImage(img);
        updateEditorState({ historyIndex: newIndex });
        
        // Reset mask
        if (maskCanvas) {
          clearCanvas(maskCanvas);
        }
      } catch (error) {
        console.error('Error in undo:', error);
      }
    }
  }, [editorState.historyIndex, editorState.history, maskCanvas, updateEditorState]);

  const handleRedo = useCallback(async () => {
    if (editorState.historyIndex < editorState.history.length - 1) {
      const newIndex = editorState.historyIndex + 1;
      const historyState = editorState.history[newIndex];
      
      try {
        const img = await dataURLToImage(historyState.imageData);
        setImage(img);
        updateEditorState({ historyIndex: newIndex });
        
        // Reset mask
        if (maskCanvas) {
          clearCanvas(maskCanvas);
        }
      } catch (error) {
        console.error('Error in redo:', error);
      }
    }
  }, [editorState.historyIndex, editorState.history, maskCanvas, updateEditorState]);

  const handleExport = useCallback(() => {
    if (!image) {
      alert('No hay imagen para exportar');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(image, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    }
  }, [image]);

  const handleAIExecute = useCallback(async (params: AIExecuteParams) => {
    if (!image) {
      alert('No hay imagen cargada');
      return;
    }

    updateEditorState({ isProcessing: true });

    try {
      const imageData = imageToDataURL(image);
      const maskData = maskCanvas ? maskCanvas.toDataURL('image/png') : '';
      
      let resultDataURL: string;

      switch (editorState.currentTool) {
        case 'remove-object':
          resultDataURL = await aiService.removeObject(imageData, maskData);
          break;
        case 'expand-image':
          resultDataURL = await aiService.expandImage(
            imageData,
            params.expandDirection || 'all',
            params.expandPixels || 256
          );
          break;
        case 'inpaint':
          resultDataURL = await aiService.inpaint(
            imageData,
            maskData,
            params.prompt || '',
            params.negativePrompt
          );
          break;
        case 'enhance-quality':
          resultDataURL = await aiService.enhanceQuality(
            imageData,
            params.strength || 0.8
          );
          break;
        case 'edit-with-text':
          resultDataURL = await aiService.editWithText(
            imageData,
            maskData,
            params.prompt || '',
            params.strength || 0.8
          );
          break;
        default:
          throw new Error('Herramienta no implementada');
      }

      // Cargar resultado
      const resultImage = await dataURLToImage(resultDataURL);
      setImage(resultImage);
      addToHistory(resultDataURL);

      // Limpiar máscara
      if (maskCanvas) {
        clearCanvas(maskCanvas);
      }

      alert('¡Procesamiento completado! (Modo demo - imagen sin cambios)');
    } catch (error) {
      console.error('Error in AI processing:', error);
      alert('Error al procesar con IA: ' + (error as Error).message);
    } finally {
      updateEditorState({ isProcessing: false });
    }
  }, [image, maskCanvas, editorState.currentTool, addToHistory, updateEditorState]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>✨ Editor de Fotos con IA</h1>
        <p>Edita, mejora y restaura tus fotografías con inteligencia artificial</p>
      </header>

      <div className="app-content">
        <Toolbar
          editorState={editorState}
          onStateChange={updateEditorState}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onExport={handleExport}
          onLoadImage={handleLoadImage}
          canUndo={editorState.historyIndex > 0}
          canRedo={editorState.historyIndex < editorState.history.length - 1}
        />

        <div className="canvas-area">
          {showWelcome && !image ? (
            <div className="welcome-screen">
              <h2>👋 ¡Bienvenido!</h2>
              <p>Carga una imagen para comenzar a editar</p>
              <div className="welcome-features">
                <div className="feature">
                  <span>🎨</span>
                  <h3>Eliminar Objetos</h3>
                  <p>Borra elementos no deseados de tus fotos</p>
                </div>
                <div className="feature">
                  <span>🖼️</span>
                  <h3>Expandir Imagen</h3>
                  <p>Amplía el encuadre más allá de los bordes</p>
                </div>
                <div className="feature">
                  <span>✨</span>
                  <h3>Mejorar Calidad</h3>
                  <p>Restaura y mejora fotos antiguas</p>
                </div>
                <div className="feature">
                  <span>🪄</span>
                  <h3>Relleno Generativo</h3>
                  <p>Genera contenido nuevo con IA</p>
                </div>
              </div>
              <label className="welcome-button">
                📁 Cargar Imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLoadImage(file);
                  }}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ) : (
            <ImageCanvas
              editorState={editorState}
              onStateChange={updateEditorState}
              image={image}
              maskCanvas={maskCanvas}
            />
          )}
        </div>

        <AIPanel
          currentTool={editorState.currentTool}
          onExecute={handleAIExecute}
          isProcessing={editorState.isProcessing}
        />
      </div>

      <footer className="app-footer">
        <p>💡 <strong>Modo Demo:</strong> Las funciones de IA están simuladas. Para usar IA real, configura una API key de Replicate o Stability AI.</p>
      </footer>
    </div>
  );
}

export default App;
