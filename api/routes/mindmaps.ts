import { Router, Request, Response } from 'express';
import { MindMapModel } from '../models/MindMap';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, CreateMindMapRequest, UpdateMindMapRequest } from '../types';

const router = Router();

// GET /api/mindmaps - Get all mind maps
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const mindmaps = await MindMapModel.find()
    .sort({ updatedAt: -1 })
    .limit(50);

  const response: ApiResponse = {
    success: true,
    data: mindmaps,
    message: 'Mind maps retrieved successfully'
  };

  res.json(response);
}));

// GET /api/mindmaps/:id - Get specific mind map
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || id.length !== 24) {
    return res.status(400).json({
      success: false,
      error: 'Invalid mind map ID',
      message: 'Please provide a valid mind map ID'
    });
  }

  const mindmap = await MindMapModel.findById(id);

  if (!mindmap) {
    return res.status(404).json({
      success: false,
      error: 'Mind map not found',
      message: 'The requested mind map does not exist'
    });
  }

  const response: ApiResponse = {
    success: true,
    data: mindmap,
    message: 'Mind map retrieved successfully'
  };

  res.json(response);
}));

// POST /api/mindmaps - Create new mind map
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { title, description }: CreateMindMapRequest = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Title is required',
      message: 'Please provide a title for the mind map'
    });
  }

  const mindmap = new MindMapModel({
    title: title.trim(),
    description: description?.trim(),
    nodes: [],
    connections: []
  });

  await mindmap.save();

  const response: ApiResponse = {
    success: true,
    data: mindmap,
    message: 'Mind map created successfully'
  };

  res.status(201).json(response);
}));

// PUT /api/mindmaps/:id - Update existing mind map
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: UpdateMindMapRequest = req.body;

  if (!id || id.length !== 24) {
    return res.status(400).json({
      success: false,
      error: 'Invalid mind map ID',
      message: 'Please provide a valid mind map ID'
    });
  }

  const mindmap = await MindMapModel.findById(id);

  if (!mindmap) {
    return res.status(404).json({
      success: false,
      error: 'Mind map not found',
      message: 'The requested mind map does not exist'
    });
  }

  // Update fields if provided
  if (updates.title !== undefined) {
    mindmap.title = updates.title.trim();
  }
  if (updates.description !== undefined) {
    mindmap.description = updates.description.trim();
  }
  if (updates.nodes !== undefined) {
    mindmap.nodes = updates.nodes;
  }
  if (updates.connections !== undefined) {
    mindmap.connections = updates.connections;
  }

  mindmap.updatedAt = new Date();
  await mindmap.save();

  const response: ApiResponse = {
    success: true,
    data: mindmap,
    message: 'Mind map updated successfully'
  };

  res.json(response);
}));

// DELETE /api/mindmaps/:id - Delete mind map
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || id.length !== 24) {
    return res.status(400).json({
      success: false,
      error: 'Invalid mind map ID',
      message: 'Please provide a valid mind map ID'
    });
  }

  const mindmap = await MindMapModel.findByIdAndDelete(id);

  if (!mindmap) {
    return res.status(404).json({
      success: false,
      error: 'Mind map not found',
      message: 'The requested mind map does not exist'
    });
  }

  const response: ApiResponse = {
    success: true,
    message: 'Mind map deleted successfully'
  };

  res.json(response);
}));

export default router;
