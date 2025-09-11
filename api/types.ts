export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId?: string;
  style?: NodeStyle;
  createdAt: Date;
  updatedAt: Date;
}

export interface NodeStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  shape?: 'rectangle' | 'circle' | 'diamond';
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  style?: ConnectionStyle;
}

export interface ConnectionStyle {
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface MindMap {
  id: string;
  title: string;
  description?: string;
  nodes: MindMapNode[];
  connections: Connection[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface CreateMindMapRequest {
  title: string;
  description?: string;
}

export interface UpdateMindMapRequest {
  title?: string;
  description?: string;
  nodes?: MindMapNode[];
  connections?: Connection[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
