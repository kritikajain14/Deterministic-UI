import express from 'express';
import AgentOrchestrator from '../services/AgentOrchestrator.js';
import { VersionHistory } from '../models/VersionHistory.js';

const router = express.Router();
const orchestrator = new AgentOrchestrator();

// GET /api/history
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const history = await VersionHistory.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await VersionHistory.countDocuments();
    
    res.json({
      success: true,
      data: {
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('History route error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch history',
      details: error.message 
    });
  }
});

// GET /api/history/:id
router.get('/history/:id', async (req, res) => {
  try {
    const version = await VersionHistory.findById(req.params.id)
      .select('-__v');
    
    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }
    
    res.json({
      success: true,
      data: version
    });
    
  } catch (error) {
    console.error('History detail route error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch version',
      details: error.message 
    });
  }
});

export default router;