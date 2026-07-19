import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required'],
    default: Date.now
  },
  visitType: {
    type: String,
    enum: ['INITIAL', 'FOLLOW_UP', 'EMERGENCY', 'ROUTINE'],
    required: [true, 'Visit type is required']
  },
  chiefComplaint: {
    type: String,
    trim: true
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  physicalExamination: {
    type: String,
    trim: true
  },
  laboratoryResults: {
    type: Map,
    of: String
  },
  diagnosis: {
    type: String,
    trim: true
  },
  treatmentPlan: {
    type: String,
    trim: true
  },
  medications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      trim: true
    },
    frequency: {
      type: String,
      trim: true
    },
    duration: {
      type: String,
      trim: true
    }
  }],
  dietaryRecommendations: {
    type: String,
    trim: true
  },
  followUpDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String, // URLs or file paths
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes
medicalRecordSchema.index({ patientId: 1, visitDate: -1 });
medicalRecordSchema.index({ doctorId: 1, visitDate: -1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;
