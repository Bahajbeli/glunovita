import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional if walk-in patient info is provided
    },
    // For walk-in patients (not registered on platform)
    patientName: {
        type: String,
        trim: true
    },
    patientPhone: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
        default: 'REQUESTED'
    },
    secretaryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reason: {
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

// Validation: Either patient OR (patientName AND patientPhone) must be provided
consultationSchema.pre('validate', function (next) {
    if (!this.patient && (!this.patientName || !this.patientPhone)) {
        next(new Error('Either patient reference or patient name and phone must be provided'));
    } else {
        next();
    }
});

const Consultation = mongoose.model('Consultation', consultationSchema);

export default Consultation;
