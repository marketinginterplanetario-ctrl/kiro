export type ToolType = 
  | 'select' 
  | 'brush' 
  | 'erase' 
  | 'pan' 
  | 'remove-object'
  | 'expand-image'
  | 'inpaint'
  | 'enhance-quality'
  | 'edit-with-text';

export interface HistoryState {
  imageData: string;
  timestamp: number;
}

export interface EditorState {
  currentTool: ToolType;
  brushSize: number;
  zoom: number;
  isDragging: boolean;
  history: HistoryState[];
  historyIndex: number;
  isProcessing: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}
