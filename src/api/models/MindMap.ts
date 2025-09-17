import mongoose, { Schema, Document } from "mongoose";

export interface IMindmap extends Document {
  name: string;
  nodes: { id: string; x: number; y: number; text: string }[];
  createdAt: Date;
}

const MindmapSchema = new Schema<IMindmap>(
  {
    name: { type: String, required: true },
    nodes: [
      {
        id: String,
        x: Number,
        y: Number,
        text: String,
      },
    ],
    connections: [
      {
        from: String, // id del nodo origen
        to: String,   // id del nodo destino
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IMindmap>("Mindmap", MindmapSchema);
