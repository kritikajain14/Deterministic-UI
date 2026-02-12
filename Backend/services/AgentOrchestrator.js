import PlannerAgent from '../agents/PlannerAgent.js';
import GeneratorAgent from '../agents/GeneratorAgent.js';
import ExplainerAgent from '../agents/ExplainerAgent.js';
import { VersionHistory } from '../models/VersionHistory.js';

class AgentOrchestrator {
  constructor() {
    this.planner = new PlannerAgent();
    this.generator = new GeneratorAgent();
    this.explainer = new ExplainerAgent();
  }

  /**
   * Orchestrate the complete agent pipeline for UI generation
   */
  async generateUI(userIntent, context = null) {
    try {
      console.log('AgentOrchestrator: Starting generation pipeline');
      
      // Step 1: Planning
      console.log('Step 1: Planning...');
      const plan = await this.planner.plan(userIntent, context);
      
      // Step 2: Generation - use existing code if provided
      console.log('Step 2: Generating code...');
      const generatedCode = await this.generator.generate(
        plan, 
        context?.existingCode
      );
      
      // Step 3: Explanation
      console.log('Step 3: Generating explanation...');
      const explanation = await this.explainer.explain(
        userIntent, 
        plan, 
        context?.modifications || plan.modifications
      );
      
      // Get next version number
      const lastVersion = await VersionHistory.findOne()
        .sort({ versionNumber: -1 });
      const versionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
      
      // Store in database
      const version = new VersionHistory({
        versionNumber,
        userIntent,
        plan,
        generatedCode,
        explanation
      });
      
      await version.save();
      
      // Deactivate previous active version
      if (lastVersion) {
        await VersionHistory.updateMany(
          { _id: { $ne: version._id }, isActive: true },
          { isActive: false }
        );
      }
      
      console.log('AgentOrchestrator: Pipeline completed successfully');
      
      return {
        versionNumber,
        plan,
        generatedCode,
        explanation,
        _id: version._id
      };
      
    } catch (error) {
      console.error('AgentOrchestrator: Pipeline failed:', error);
      throw error;
    }
  }

  /**
   * Iterate on existing UI based on modification request
   * This now performs TRUE incremental editing - only modifying what's needed
   */
  async iterateUI(versionId, modificationIntent) {
    try {
      console.log('AgentOrchestrator: Starting iteration pipeline');
      
      // Get current version
      const currentVersion = await VersionHistory.findById(versionId);
      if (!currentVersion) {
        throw new Error('Version not found');
      }
      
      // Pass both the previous plan AND the existing code for incremental updates
      const context = {
        previousPlan: currentVersion.plan,
        existingCode: currentVersion.generatedCode,
        modifications: modificationIntent
      };
      
      // Generate new version with modification context
      const result = await this.generateUI(modificationIntent, context);
      
      return result;
      
    } catch (error) {
      console.error('AgentOrchestrator: Iteration failed:', error);
      throw error;
    }
  }

  /**
   * Rollback to specific version
   */
  async rollbackToVersion(versionId) {
    try {
      const version = await VersionHistory.findById(versionId);
      if (!version) {
        throw new Error('Version not found');
      }
      
      // Deactivate all versions
      await VersionHistory.updateMany(
        {},
        { isActive: false }
      );
      
      // Activate requested version
      version.isActive = true;
      await version.save();
      
      return version;
      
    } catch (error) {
      console.error('AgentOrchestrator: Rollback failed:', error);
      throw error;
    }
  }

  /**
   * Get version history
   */
  async getHistory(limit = 50) {
    try {
      return await VersionHistory.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-__v');
    } catch (error) {
      console.error('AgentOrchestrator: History fetch failed:', error);
      throw error;
    }
  }
}

export default AgentOrchestrator;