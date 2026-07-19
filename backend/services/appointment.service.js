import Appointment from '../models/Appointment.model.js';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';

export const createAppointment = async (appointmentData, creatorId) => {
  // Get creator to check role
  const creator = await User.findById(creatorId);
  if (!creator) {
    throw new Error('Creator not found');
  }

  // Verify doctor exists
  const doctor = await User.findById(appointmentData.doctorId);
  if (!doctor || doctor.role !== 'DOCTOR') {
    throw new Error('Invalid doctor');
  }

  // If creator is a secretary, verify they are assigned to this doctor
  if (creator.role === 'SECRETARY') {
    if (creator.doctorId?.toString() !== appointmentData.doctorId.toString()) {
      throw new Error('Secretary can only create appointments for their assigned doctor');
    }
  }

  // If creator is a doctor, verify they are creating for themselves
  if (creator.role === 'DOCTOR') {
    if (creator._id.toString() !== appointmentData.doctorId.toString()) {
      throw new Error('Doctor can only create appointments for themselves');
    }
  }

  // If creator is a patient, verify they are creating for themselves
  if (creator.role === 'PATIENT') {
    if (creator._id.toString() !== appointmentData.patientId.toString()) {
      throw new Error('Patient can only create appointments for themselves');
    }
  }

  // Verify patient exists
  const patient = await User.findById(appointmentData.patientId);
  if (!patient || patient.role !== 'PATIENT') {
    throw new Error('Invalid patient');
  }

  // Convert appointmentDate string to Date if needed
  let appointmentDateObj = appointmentData.appointmentDate;
  if (typeof appointmentDateObj === 'string') {
    appointmentDateObj = new Date(appointmentDateObj);
    appointmentDateObj.setHours(0, 0, 0, 0);
  }

  // Check for conflicts
  const existingAppointment = await Appointment.findOne({
    doctorId: appointmentData.doctorId,
    appointmentDate: {
      $gte: new Date(appointmentDateObj.getTime()),
      $lt: new Date(appointmentDateObj.getTime() + 24 * 60 * 60 * 1000)
    },
    startTime: appointmentData.startTime,
    status: { $nin: ['CANCELLED', 'NO_SHOW'] }
  });

  if (existingAppointment) {
    throw new Error('Time slot already booked');
  }

  const appointment = new Appointment({
    ...appointmentData,
    appointmentDate: appointmentDateObj,
    createdBy: creatorId
  });

  await appointment.save();
  await appointment.populate('patientId', 'firstName lastName email phoneNumber');
  await appointment.populate('doctorId', 'firstName lastName email');
  await appointment.populate('createdBy', 'firstName lastName');

  await AuditLog.create({
    userId: creatorId,
    action: 'APPOINTMENT_CREATE',
    resourceType: 'APPOINTMENT',
    resourceId: appointment._id,
    status: 'SUCCESS'
  });

  return appointment;
};

export const getDailyAppointments = async (doctorId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await Appointment.find({
    doctorId,
    appointmentDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  })
    .populate('patientId', 'firstName lastName email phoneNumber')
    .sort({ startTime: 1 });
};

export const getAppointmentsByDoctor = async (doctorId, filters = {}) => {
  const query = { doctorId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.date) {
    const startOfDay = new Date(filters.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filters.date);
    endOfDay.setHours(23, 59, 59, 999);
    query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
  }

  return await Appointment.find(query)
    .populate('patientId', 'firstName lastName email phoneNumber')
    .sort({ appointmentDate: 1, startTime: 1 });
};

export const updateAppointmentStatus = async (appointmentId, status, userId) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  appointment.status = status;
  
  if (status === 'CANCELLED') {
    appointment.cancelledBy = userId;
  }

  await appointment.save();

  await AuditLog.create({
    userId,
    action: 'APPOINTMENT_UPDATE',
    resourceType: 'APPOINTMENT',
    resourceId: appointment._id,
    status: 'SUCCESS',
    details: { newStatus: status }
  });

  return appointment;
};

export const deleteAppointment = async (appointmentId, userId) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  await Appointment.findByIdAndDelete(appointmentId);

  await AuditLog.create({
    userId,
    action: 'APPOINTMENT_DELETE',
    resourceType: 'APPOINTMENT',
    resourceId: appointment._id,
    status: 'SUCCESS'
  });
};

export const getAvailableTimeSlots = async (doctorId, date, duration = 30) => {
  // Verify doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'DOCTOR') {
    throw new Error('Invalid doctor');
  }

  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all appointments for this doctor on this date
  const appointments = await Appointment.find({
    doctorId,
    appointmentDate: {
      $gte: selectedDate,
      $lte: endOfDay
    },
    status: { $nin: ['CANCELLED', 'NO_SHOW'] }
  }).sort({ startTime: 1 });

  // Default working hours: 9:00 AM to 6:00 PM
  const workingHours = {
    start: 9, // 9 AM
    end: 18   // 6 PM
  };

  // Generate all possible time slots
  const allSlots = [];
  for (let hour = workingHours.start; hour < workingHours.end; hour++) {
    for (let minute = 0; minute < 60; minute += duration) {
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      allSlots.push(timeString);
    }
  }

  // Filter out booked slots
  const bookedSlots = new Set();
  appointments.forEach(appointment => {
    bookedSlots.add(appointment.startTime);
    // Also mark slots that overlap with this appointment
    const [startHour, startMinute] = appointment.startTime.split(':').map(Number);
    const appointmentEndMinutes = startHour * 60 + startMinute + (appointment.duration || 30);
    
    allSlots.forEach(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      const slotStartMinutes = slotHour * 60 + slotMinute;
      const slotEndMinutes = slotStartMinutes + duration;
      
      // Check if slots overlap
      if (slotStartMinutes < appointmentEndMinutes && slotEndMinutes > (startHour * 60 + startMinute)) {
        bookedSlots.add(slot);
      }
    });
  });

  // Return available slots
  const availableSlots = allSlots.filter(slot => !bookedSlots.has(slot));

  return availableSlots;
};
