import mongoose, { Document, Schema } from 'mongoose';
import { MindMapNode, Connection } from '../types';

export interface MindMapDocument extends Document {
  title: string;
  description?: string;
  nodes: MindMapNode[];
  connections: Connection[];
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NodeStyleSchema = new Schema({
  backgroundColor: { type: String, default: '#3b82f6' },
  textColor: { type: String, default: '#ffffff' },
  borderColor: { type: String, default: '#1d4ed8' },
  borderWidth: { type: Number, default: 2 },
  borderRadius: { type: Number, default: 8 },
  fontSize: { type: Number, default: 14 },
  fontWeight: { type: String, enum: ['normal', 'bold'], default: 'normal' },
  shape: { type: String, enum: ['rectangle', 'circle', 'diamond'], default: 'rectangle' }
}, { _id: false });

const MindMapNodeSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  parentId: { type: String },
  style: { type: NodeStyleSchema, default: {} }
}, { _id: false });

const ConnectionStyleSchema = new Schema({
  color: { type: String, default: '#64748b' },
  width: { type: Number, default: 2 },
  style: { type: String, enum: ['solid', 'dashed', 'dotted'], default: 'solid' }
}, { _id: false });

const ConnectionSchema = new Schema({
  id: { type: String, required: true },
  fromNodeId: { type: String, required: true },
  toNodeId: { type: String, required: true },
  style: { type: ConnectionStyleSchema, default: {} }
}, { _id: false });

const MindMapSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  nodes: [MindMapNodeSchema],
  connections: [ConnectionSchema],
  userId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
MindMapSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const MindMapModel = mongoose.model<MindMapDocument>('MindMap', MindMapSchema);
