import Consultation from '../models/Consultation.model.js';
import User from '../models/User.model.js';

export const createConsultation = async (req, res, next) => {
    try {
        const { doctorId, date, reason } = req.body;
        const patientId = req.user._id;

        // Verify doctor exists and is a doctor
        const doctor = await User.findOne({ _id: doctorId, role: 'DOCTOR' });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        const consultation = await Consultation.create({
            doctor: doctorId,
            patient: patientId,
            date,
            reason
        });

        res.status(201).json({
            success: true,
            message: 'Consultation booked successfully',
            data: consultation
        });
    } catch (error) {
        next(error);
    }
};

export const getMyConsultations = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        let query = {};
        if (role === 'DOCTOR') {
            query = { doctor: userId };
        } else if (role === 'SECRETARY') {
            // Secretary sees consultations for their assigned doctors
            query = { doctor: { $in: req.user.assignedDoctors } };
        } else {
            query = { patient: userId };
        }

        const consultations = await Consultation.find(query)
            .populate('doctor', 'firstName lastName specialization location address')
            .populate('patient', 'firstName lastName phoneNumber')
            .populate('secretaryId', 'firstName lastName')
            .sort({ date: 1 });

        res.status(200).json({
            success: true,
            data: consultations
        });
    } catch (error) {
        next(error);
    }
};

export const updateConsultationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const consultationId = req.params.id;

        // Only doctors should be able to confirm/cancel? Or maybe patients can cancel.
        // simplistic implementation for now.

        const consultation = await Consultation.findById(consultationId);

        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: 'Consultation not found'
            });
        }

        // Authorization check
        const isDoctor = req.user.role === 'DOCTOR' && consultation.doctor.toString() === req.user._id.toString();
        const isSecretary = req.user.role === 'SECRETARY' && req.user.assignedDoctors.includes(consultation.doctor.toString());
        const isPatient = req.user.role === 'PATIENT' && consultation.patient.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'ADMIN';

        if (!isDoctor && !isSecretary && !isPatient && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this consultation'
            });
        }

        // Patients can only CANCEL
        if (isPatient && status !== 'CANCELLED') {
            return res.status(403).json({ success: false, message: 'Patients can only cancel appointments' });
        }

        consultation.status = status;
        if (req.user.role === 'SECRETARY') {
            consultation.secretaryId = req.user._id;
        }

        await consultation.save();

        res.status(200).json({
            success: true,
            message: 'Consultation updated',
            data: consultation
        });
    } catch (error) {
        next(error);
    }
};

// Create consultation manually (for walk-in patients)
export const createManualConsultation = async (req, res, next) => {
    try {
        const { doctorId, patientId, patientName, patientPhone, date, reason, status } = req.body;

        // Verify doctor exists and is a doctor
        const doctor = await User.findOne({ _id: doctorId, role: 'DOCTOR' });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Check authorization
        if (req.user.role === 'SECRETARY' && !req.user.assignedDoctors.includes(doctorId)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create consultations for this doctor'
            });
        }

        // Validate: Either patientId OR (patientName AND patientPhone) must be provided
        if (!patientId && (!patientName || !patientPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Either patient ID or patient name and phone must be provided'
            });
        }

        // If patientId is provided, verify patient exists
        if (patientId) {
            const patient = await User.findOne({ _id: patientId, role: 'PATIENT' });
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }
        }

        // Create consultation data
        const consultationData = {
            doctor: doctorId,
            date,
            reason,
            status: status || 'CONFIRMED', // Manual consultations are usually confirmed immediately
            secretaryId: req.user._id
        };

        // Add patient reference OR walk-in patient info
        if (patientId) {
            consultationData.patient = patientId;
        } else {
            consultationData.patientName = patientName;
            consultationData.patientPhone = patientPhone;
        }

        const consultation = await Consultation.create(consultationData);

        // Populate consultation with available data
        let populatedConsultation = await Consultation.findById(consultation._id)
            .populate('doctor', 'firstName lastName specialization')
            .populate('secretaryId', 'firstName lastName');

        // Only populate patient if it exists
        if (consultation.patient) {
            populatedConsultation = await Consultation.findById(consultation._id)
                .populate('doctor', 'firstName lastName specialization')
                .populate('patient', 'firstName lastName phoneNumber')
                .populate('secretaryId', 'firstName lastName');
        }

        res.status(201).json({
            success: true,
            message: 'Consultation created successfully',
            data: populatedConsultation
        });
    } catch (error) {
        next(error);
    }
};


