import mongoose from 'mongoose';

const patientDeclarationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
    index: true
  },
  declarationDate: {
    type: Date,
    required: [true, 'Declaration date is required'],
    default: Date.now
  },
  diagnosisDate: {
    type: Date
  },
  diagnosisLocation: {
    type: String,
    trim: true
  },
  diagnosingDoctor: {
    type: String,
    trim: true
  },
  medicalEvidence: {
    type: String,
    enum: ['BIOPSY', 'SEROLOGY', 'GENETIC_TEST', 'CLINICAL']
  },
  /** Formulaire détaillé maladie cœliaque (sections 1–14) */
  celiacForm: {
    type: mongoose.Schema.Types.Mixed
  },
  supportingDocuments: [{
    type: String, // URLs or file paths
    trim: true
  }],
  aiDecision: {
    type: mongoose.Schema.Types.Mixed // Will store { isSick: boolean, reason: string }
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
    index: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
patientDeclarationSchema.index({ patientId: 1, status: 1 });
patientDeclarationSchema.index({ status: 1, createdAt: -1 });

const PatientDeclaration = mongoose.model('PatientDeclaration', patientDeclarationSchema);

export default PatientDeclaration;
