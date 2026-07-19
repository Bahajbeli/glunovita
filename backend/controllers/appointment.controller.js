import * as appointmentService from '../services/appointment.service.js';

export const createAppointment = async (req, res, next) => {
  try {
    // For secretaries, force the doctorId to be their assigned doctor
    let appointmentData = { ...req.body };
    
    if (req.user.role === 'SECRETARY') {
      if (!req.user.doctorId) {
        return res.status(403).json({
          success: false,
          message: 'Secretary must be assigned to a doctor'
        });
      }
      appointmentData.doctorId = req.user.doctorId;
    } else if (req.user.role === 'DOCTOR') {
      // Doctors can only create appointments for themselves
      appointmentData.doctorId = req.user._id;
    } else if (req.user.role === 'PATIENT') {
      // Patients can create appointments, set patientId to their own ID
      appointmentData.patientId = req.user._id;
    }

    const appointment = await appointmentService.createAppointment(appointmentData, req.user._id);
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAvailableTimeSlots = async (req, res, next) => {
  try {
    const { doctorId, date, duration } = req.query;
    
    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and date are required'
      });
    }

    const slots = await appointmentService.getAvailableTimeSlots(
      doctorId,
      date,
      parseInt(duration) || 30
    );

    res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getDailyAppointments = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;
    
    let targetDoctorId = doctorId;
    
    // If secretary, get their doctor's appointments
    if (req.user.role === 'SECRETARY') {
      targetDoctorId = req.user.doctorId;
    } else if (req.user.role === 'DOCTOR') {
      targetDoctorId = req.user._id;
    }

    const appointments = await appointmentService.getDailyAppointments(
      targetDoctorId,
      date || new Date()
    );

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsByDoctor = async (req, res, next) => {
  try {
    let doctorId = req.user._id;
    
    // If secretary, get their doctor's appointments
    if (req.user.role === 'SECRETARY') {
      doctorId = req.user.doctorId;
    }

    const appointments = await appointmentService.getAppointmentsByDoctor(doctorId, req.query);
    
    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await appointmentService.updateAppointmentStatus(
      req.params.id,
      status,
      req.user._id
    );
    
    res.status(200).json({
      success: true,
      message: 'Appointment status updated',
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    await appointmentService.deleteAppointment(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
