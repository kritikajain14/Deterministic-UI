// backend/routes/generationRoutes.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import AgentOrchestrator from '../services/AgentOrchestrator.js';

const router = express.Router();
const orchestrator = new AgentOrchestrator();

// POST /api/generate
router.post('/generate',
  [
    body('userIntent')
      .isString()
      .trim()
      .isLength({ min: 3, max: 500 })
      .escape()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userIntent } = req.body;
      
      // Basic prompt injection filtering
      const blockedPatterns = [
        'ignore previous',
        'bypass',
        'system prompt',
        'admin',
        'root',
        'exec(',
        'eval('
      ];
      
      const containsBlocked = blockedPatterns.some(pattern => 
        userIntent.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (containsBlocked) {
        return res.status(400).json({ 
          error: 'Invalid input contains blocked patterns' 
        });
      }

      const result = await orchestrator.generateUI(userIntent);
      
      res.status(201).json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Generation route error:', error);
      res.status(500).json({ 
        error: 'Generation failed',
        details: error.message 
      });
    }
});

// POST /api/iterate
router.post('/iterate',
  [
    body('versionId').isMongoId(),
    body('modificationIntent')
      .isString()
      .trim()
      .isLength({ min: 3, max: 500 })
      .escape()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { versionId, modificationIntent } = req.body;
      
      const result = await orchestrator.iterateUI(versionId, modificationIntent);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Iteration route error:', error);
      res.status(500).json({ 
        error: 'Iteration failed',
        details: error.message 
      });
    }
});

// POST /api/rollback
router.post('/rollback',
  [body('versionId').isMongoId()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { versionId } = req.body;
      
      const result = await orchestrator.rollbackToVersion(versionId);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Rollback route error:', error);
      res.status(500).json({ 
        error: 'Rollback failed',
        details: error.message 
      });
    }
});

export default router;