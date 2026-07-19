import MedicalRecord from '../models/MedicalRecord.model.js';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';

export const createMedicalRecord = async (doctorId, recordData) => {
  // Verify doctor exists and is active
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'DOCTOR' || !doctor.isActive) {
    throw new Error('Invalid doctor');
  }

  // Verify patient exists
  const patient = await User.findById(recordData.patientId);
  if (!patient || patient.role !== 'PATIENT') {
    throw new Error('Invalid patient');
  }

  const record = new MedicalRecord({
    doctorId,
    ...recordData
  });

  await record.save();
  await record.populate('patientId', 'firstName lastName email');
  await record.populate('doctorId', 'firstName lastName email');

  await AuditLog.create({
    userId: doctorId,
    action: 'MEDICAL_RECORD_CREATE',
    resourceType: 'MEDICAL_RECORD',
    resourceId: record._id,
    status: 'SUCCESS',
    details: { patientId: recordData.patientId }
  });

  return record;
};

export const getMedicalRecords = async (userId, userRole) => {
  if (userRole === 'PATIENT') {
    return await MedicalRecord.find({ patientId: userId })
      .populate('doctorId', 'firstName lastName email licenseNumber')
      .sort({ visitDate: -1 });
  } else if (userRole === 'DOCTOR') {
    return await MedicalRecord.find({ doctorId: userId })
      .populate('patientId', 'firstName lastName email')
      .sort({ visitDate: -1 });
  } else if (userRole === 'ADMIN') {
    return await MedicalRecord.find()
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'firstName lastName email')
      .sort({ visitDate: -1 });
  }
  throw new Error('Unauthorized');
};

export const getMedicalRecordById = async (recordId, userId, userRole) => {
  const record = await MedicalRecord.findById(recordId)
    .populate('patientId', 'firstName lastName email')
    .populate('doctorId', 'firstName lastName email');

  if (!record) {
    throw new Error('Medical record not found');
  }

  // Check access permissions
  if (userRole === 'PATIENT' && record.patientId._id.toString() !== userId.toString()) {
    throw new Error('Access denied');
  }
  if (userRole === 'DOCTOR' && record.doctorId._id.toString() !== userId.toString()) {
    throw new Error('Access denied');
  }

  await AuditLog.create({
    userId,
    action: 'MEDICAL_RECORD_VIEW',
    resourceType: 'MEDICAL_RECORD',
    resourceId: record._id,
    status: 'SUCCESS'
  });

  return record;
};

export const updateMedicalRecord = async (recordId, doctorId, updateData) => {
  const record = await MedicalRecord.findById(recordId);

  if (!record) {
    throw new Error('Medical record not found');
  }

  // Only the creating doctor or admin can update
  if (record.doctorId.toString() !== doctorId.toString()) {
    throw new Error('Access denied. Only the creating doctor can update this record.');
  }

  Object.assign(record, updateData);
  await record.save();
  await record.populate('patientId', 'firstName lastName email');
  await record.populate('doctorId', 'firstName lastName email');

  await AuditLog.create({
    userId: doctorId,
    action: 'MEDICAL_RECORD_UPDATE',
    resourceType: 'MEDICAL_RECORD',
    resourceId: record._id,
    status: 'SUCCESS'
  });

  return record;
};

export const deleteMedicalRecord = async (recordId, userId, userRole) => {
  const record = await MedicalRecord.findById(recordId);

  if (!record) {
    throw new Error('Medical record not found');
  }

  // Only admin or creating doctor can delete
  if (userRole !== 'ADMIN' && record.doctorId.toString() !== userId.toString()) {
    throw new Error('Access denied');
  }

  await MedicalRecord.findByIdAndDelete(recordId);

  await AuditLog.create({
    userId,
    action: 'MEDICAL_RECORD_DELETE',
    resourceType: 'MEDICAL_RECORD',
    resourceId: record._id,
    status: 'SUCCESS'
  });

  return { message: 'Medical record deleted successfully' };
};
