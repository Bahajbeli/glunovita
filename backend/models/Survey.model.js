import mongoose from 'mongoose';

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Survey title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [{
    questionText: {
      type: String,
      required: true,
      trim: true
    },
    questionType: {
      type: String,
      enum: ['TEXT', 'MULTIPLE_CHOICE', 'RATING', 'YES_NO', 'SCALE'],
      required: true
    },
    options: [{
      type: String,
      trim: true
    }],
    isRequired: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      required: true
    }
  }],
  targetRoles: [{
    type: String,
    enum: ['PATIENT', 'DOCTOR', 'ADMIN', 'AUTHORITY']
  }],
  targetRegions: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  responses: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      answer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      }
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
surveySchema.index({ isActive: 1, endDate: 1 });
surveySchema.index({ targetRoles: 1, startDate: -1 });

const Survey = mongoose.model('Survey', surveySchema);

export default Survey;
