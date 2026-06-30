import { useState } from 'react';
import { ToolType } from '../types';

interface AIPanelProps {
  currentTool: ToolType;
  onExecute: (params: AIExecuteParams) => void;
  isProcessing: boolean;
}

export interface AIExecuteParams {
  prompt?: string;
  negativePrompt?: string;
  strength?: number;
  expandDirection?: 'all' | 'left' | 'right' | 'top' | 'bottom';
  expandPixels?: number;
}

export const AIPanel = ({ currentTool, onExecute, isProcessing }: AIPanelProps) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [strength, setStrength] = useState(0.8);
  const [expandDirection, setExpandDirection] = useState<'all' | 'left' | 'right' | 'top' | 'bottom'>('all');
  const [expandPixels, setExpandPixels] = useState(256);

  const handleExecute = () => {
    const params: AIExecuteParams = {};

    switch (currentTool) {
      case 'edit-with-text':
        params.prompt = prompt;
        params.negativePrompt = negativePrompt;
        params.strength = strength;
        break;
      case 'expand-image':
        params.expandDirection = expandDirection;
        params.expandPixels = expandPixels;
        break;
      case 'inpaint':
        params.prompt = prompt;
        params.negativePrompt = negativePrompt;
        break;
      case 'enhance-quality':
        params.strength = strength;
        break;
    }

    onExecute(params);
  };

  if (!['remove-object', 'expand-image', 'inpaint', 'enhance-quality', 'edit-with-text'].includes(currentTool)) {
    return null;
  }

  return (
    <div className="ai-panel">
      <h2>Configuración de IA</h2>
      
      {currentTool === 'remove-object' && (
        <div className="ai-panel-content">
          <p>1. Usa el pincel para marcar el objeto que deseas eliminar</p>
          <p>2. Haz clic en "Aplicar" para procesar con IA</p>
          <button 
            className="execute-button" 
            onClick={handleExecute}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Aplicar Eliminación'}
          </button>
        </div>
      )}

      {currentTool === 'expand-image' && (
        <div className="ai-panel-content">
          <label>
            Dirección de Expansión:
            <select 
              value={expandDirection} 
              onChange={(e) => setExpandDirection(e.target.value as any)}
              disabled={isProcessing}
            >
              <option value="all">Todas las direcciones</option>
              <option value="left">Izquierda</option>
              <option value="right">Derecha</option>
              <option value="top">Arriba</option>
              <option value="bottom">Abajo</option>
            </select>
          </label>
          <label>
            Píxeles a expandir:
            <input
              type="number"
              min="64"
              max="512"
              step="64"
              value={expandPixels}
              onChange={(e) => setExpandPixels(parseInt(e.target.value))}
              disabled={isProcessing}
            />
          </label>
          <button 
            className="execute-button" 
            onClick={handleExecute}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Expandir Imagen'}
          </button>
        </div>
      )}

      {currentTool === 'inpaint' && (
        <div className="ai-panel-content">
          <p>1. Marca el área con el pincel</p>
          <p>2. Describe qué quieres generar en esa área</p>
          <label>
            Descripción (prompt):
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: un gato naranja, un árbol, cielo azul..."
              rows={3}
              disabled={isProcessing}
            />
          </label>
          <label>
            Qué evitar (opcional):
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Ej: borroso, mal detalle, distorsionado..."
              rows={2}
              disabled={isProcessing}
            />
          </label>
          <button 
            className="execute-button" 
            onClick={handleExecute}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Generar Relleno'}
          </button>
        </div>
      )}

      {currentTool === 'enhance-quality' && (
        <div className="ai-panel-content">
          <p>Mejora la calidad y resolución de la imagen usando IA</p>
          <label>
            Intensidad:
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.1"
              value={strength}
              onChange={(e) => setStrength(parseFloat(e.target.value))}
              disabled={isProcessing}
            />
            <span>{Math.round(strength * 100)}%</span>
          </label>
          <button 
            className="execute-button" 
            onClick={handleExecute}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Mejorar Calidad'}
          </button>
        </div>
      )}

      {currentTool === 'edit-with-text' && (
        <div className="ai-panel-content">
          <p>1. Marca el área que deseas editar</p>
          <p>2. Describe los cambios que deseas</p>
          <label>
            Instrucciones de edición:
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: cambiar el color a rojo, agregar sombras, hacer más brillante..."
              rows={3}
              disabled={isProcessing}
            />
          </label>
          <label>
            Intensidad del cambio:
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.1"
              value={strength}
              onChange={(e) => setStrength(parseFloat(e.target.value))}
              disabled={isProcessing}
            />
            <span>{Math.round(strength * 100)}%</span>
          </label>
          <button 
            className="execute-button" 
            onClick={handleExecute}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Aplicar Edición'}
          </button>
        </div>
      )}
    </div>
  );
};
