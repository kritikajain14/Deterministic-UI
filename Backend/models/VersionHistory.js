import mongoose from 'mongoose';

const componentPlanSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Button', 'Card', 'Input', 'Table', 'Modal', 'Sidebar', 'Navbar', 'Chart']
  },
  props: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  children: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
}, { _id: false });

const planSchema = new mongoose.Schema({
  layout: {
    type: String,
    required: true
  },
  components: [componentPlanSchema],
  modifications: {
  type: [String],
  default: []
}

}, { _id: false });

const versionHistorySchema = new mongoose.Schema({
  versionNumber: {
    type: Number,
    required: true
  },
  userIntent: {
    type: String,
    required: true
  },
  plan: {
    type: planSchema,
    required: true
  },
  generatedCode: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

versionHistorySchema.index({ versionNumber: -1, createdAt: -1 });

export const VersionHistory = mongoose.model('VersionHistory', versionHistorySchema);