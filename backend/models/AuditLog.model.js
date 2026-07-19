import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'LOGIN',
      'LOGOUT',
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'PATIENT_DECLARATION_CREATE',
      'PATIENT_DECLARATION_APPROVE',
      'PATIENT_DECLARATION_REJECT',
      'MEDICAL_RECORD_CREATE',
      'MEDICAL_RECORD_UPDATE',
      'MEDICAL_RECORD_VIEW',
      'MEDICAL_RECORD_DELETE',
      'NOTIFICATION_CREATE',
      'NOTIFICATION_SEND',
      'SURVEY_CREATE',
      'SURVEY_RESPOND',
      'STATISTICS_VIEW',
      'DATA_EXPORT',
      'PERMISSION_DENIED',
      'UNAUTHORIZED_ACCESS',
      'PRODUCT_CREATE',
      'PRODUCT_UPDATE',
      'PRODUCT_DELETE',
      'PRODUCT_VIEW',
      'ORDER_CREATE',
      'ORDER_UPDATE',
      'ORDER_VIEW',
      'APPOINTMENT_CREATE',
      'APPOINTMENT_UPDATE',
      'APPOINTMENT_DELETE',
      'SECRETARY_CREATE',
      'SECRETARY_REMOVE'
    ],
    index: true
  },
  resourceType: {
    type: String,
    enum: ['USER', 'PATIENT_DECLARATION', 'MEDICAL_RECORD', 'NOTIFICATION', 'SURVEY', 'STATISTICS', 'AUDIT_LOG', 'PRODUCT', 'ORDER', 'APPOINTMENT'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'UNAUTHORIZED'],
    default: 'SUCCESS'
  },
  errorMessage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });

// TTL index to auto-delete logs older than 2 years (optional, can be adjusted)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
