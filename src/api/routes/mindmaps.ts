import { Router } from 'express';
import MindMap from '../models/MindMap';


const router = Router();


// Create new mindmap
router.post('/', async (req, res) => {
try {
const { name, nodes, connections } = req.body;
const saved = await MindMap.create({ name, nodes, connections });
res.status(201).json(saved);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Server error' });
}
});


// Get all
router.get('/', async (req, res) => {
try {
const maps = await MindMap.find().sort({ createdAt: -1 }).lean();
res.json(maps);
} catch (err) {
res.status(500).json({ error: 'Server error' });
}
});


// Get one
router.get('/:id', async (req, res) => {
try {
const map = await MindMap.findById(req.params.id).lean();
if (!map) return res.status(404).json({ error: 'Not found' });
res.json(map);
} catch (err) {
res.status(500).json({ error: 'Server error' });
}
});


// Delete
router.delete('/:id', async (req, res) => {
try {
await MindMap.findByIdAndDelete(req.params.id);
res.json({ ok: true });
} catch (err) {
res.status(500).json({ error: 'Server error' });
}
});


export default router;