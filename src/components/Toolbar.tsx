import { 
  MousePointer, 
  Paintbrush, 
  Eraser, 
  Hand, 
  Trash2, 
  Maximize2, 
  Wand2, 
  Sparkles,
  Type,
  Undo,
  Redo,
  Download,
  Upload,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { ToolType, EditorState } from '../types';

interface ToolbarProps {
  editorState: EditorState;
  onStateChange: (state: Partial<EditorState>) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onLoadImage: (file: File) => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Toolbar = ({
  editorState,
  onStateChange,
  onUndo,
  onRedo,
  onExport,
  onLoadImage,
  canUndo,
  canRedo,
}: ToolbarProps) => {
  const tools: Array<{ type: ToolType; icon: JSX.Element; label: string; isAI?: boolean }> = [
    { type: 'select', icon: <MousePointer size={20} />, label: 'Seleccionar' },
    { type: 'brush', icon: <Paintbrush size={20} />, label: 'Pincel' },
    { type: 'erase', icon: <Eraser size={20} />, label: 'Borrador' },
    { type: 'pan', icon: <Hand size={20} />, label: 'Mover' },
    { type: 'remove-object', icon: <Trash2 size={20} />, label: 'Eliminar Objeto', isAI: true },
    { type: 'expand-image', icon: <Maximize2 size={20} />, label: 'Expandir Imagen', isAI: true },
    { type: 'inpaint', icon: <Wand2 size={20} />, label: 'Relleno Generativo', isAI: true },
    { type: 'enhance-quality', icon: <Sparkles size={20} />, label: 'Mejorar Calidad', isAI: true },
    { type: 'edit-with-text', icon: <Type size={20} />, label: 'Editar con Texto', isAI: true },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadImage(file);
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Archivo</h3>
        <label className="toolbar-button" title="Cargar Imagen">
          <Upload size={20} />
          <span>Cargar</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </label>
        <button 
          className="toolbar-button" 
          onClick={onExport}
          title="Exportar Imagen"
        >
          <Download size={20} />
          <span>Exportar</span>
        </button>
      </div>

      <div className="toolbar-section">
        <h3>Historial</h3>
        <button 
          className="toolbar-button" 
          onClick={onUndo}
          disabled={!canUndo}
          title="Deshacer"
        >
          <Undo size={20} />
          <span>Deshacer</span>
        </button>
        <button 
          className="toolbar-button" 
          onClick={onRedo}
          disabled={!canRedo}
          title="Rehacer"
        >
          <Redo size={20} />
          <span>Rehacer</span>
        </button>
      </div>

      <div className="toolbar-section">
        <h3>Zoom</h3>
        <button 
          className="toolbar-button" 
          onClick={() => onStateChange({ zoom: Math.min(5, editorState.zoom * 1.2) })}
          title="Acercar"
        >
          <ZoomIn size={20} />
          <span>Acercar</span>
        </button>
        <button 
          className="toolbar-button" 
          onClick={() => onStateChange({ zoom: Math.max(0.1, editorState.zoom * 0.8) })}
          title="Alejar"
        >
          <ZoomOut size={20} />
          <span>Alejar</span>
        </button>
        <div className="zoom-display">{Math.round(editorState.zoom * 100)}%</div>
      </div>

      <div className="toolbar-section">
        <h3>Herramientas Básicas</h3>
        {tools.filter(t => !t.isAI).map((tool) => (
          <button
            key={tool.type}
            className={`toolbar-button ${editorState.currentTool === tool.type ? 'active' : ''}`}
            onClick={() => onStateChange({ currentTool: tool.type })}
            title={tool.label}
          >
            {tool.icon}
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {(editorState.currentTool === 'brush' || editorState.currentTool === 'erase') && (
        <div className="toolbar-section">
          <h3>Tamaño del Pincel</h3>
          <input
            type="range"
            min="5"
            max="100"
            value={editorState.brushSize}
            onChange={(e) => onStateChange({ brushSize: parseInt(e.target.value) })}
            className="brush-size-slider"
          />
          <div className="brush-size-display">{editorState.brushSize}px</div>
        </div>
      )}

      <div className="toolbar-section ai-section">
        <h3>🤖 Herramientas con IA</h3>
        {tools.filter(t => t.isAI).map((tool) => (
          <button
            key={tool.type}
            className={`toolbar-button ai-button ${editorState.currentTool === tool.type ? 'active' : ''}`}
            onClick={() => onStateChange({ currentTool: tool.type })}
            title={tool.label}
            disabled={editorState.isProcessing}
          >
            {tool.icon}
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      {editorState.isProcessing && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <span>Procesando con IA...</span>
        </div>
      )}
    </div>
  );
};
