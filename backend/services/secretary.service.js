import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';

export const createSecretary = async (secretaryData, doctorId) => {
  const { email, password, firstName, lastName } = secretaryData;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Verify doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'DOCTOR') {
    throw new Error('Invalid doctor');
  }

  const secretary = new User({
    email,
    password,
    firstName,
    lastName,
    role: 'SECRETARY',
    doctorId: doctorId,
    isActive: true
  });

  await secretary.save();

  await AuditLog.create({
    userId: doctorId,
    action: 'SECRETARY_CREATE',
    resourceType: 'USER',
    resourceId: secretary._id,
    status: 'SUCCESS',
    details: { secretaryEmail: email }
  });

  return {
    _id: secretary._id,
    email: secretary.email,
    firstName: secretary.firstName,
    lastName: secretary.lastName,
    role: secretary.role,
    doctorId: secretary.doctorId
  };
};

export const getSecretariesByDoctor = async (doctorId) => {
  return await User.find({
    role: 'SECRETARY',
    doctorId: doctorId,
    isActive: true
  }).select('-password -refreshToken');
};

export const removeSecretary = async (secretaryId, doctorId) => {
  const secretary = await User.findOne({
    _id: secretaryId,
    role: 'SECRETARY',
    doctorId: doctorId
  });

  if (!secretary) {
    throw new Error('Secretary not found or not authorized');
  }

  secretary.isActive = false;
  await secretary.save();

  await AuditLog.create({
    userId: doctorId,
    action: 'SECRETARY_REMOVE',
    resourceType: 'USER',
    resourceId: secretary._id,
    status: 'SUCCESS'
  });

  return { message: 'Secretary removed successfully' };
};
