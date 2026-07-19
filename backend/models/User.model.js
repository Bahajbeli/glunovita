import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [function() { return !this.googleId; }, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['PATIENT', 'DOCTOR', 'ADMIN', 'AUTHORITY', 'SECRETARY'],
    required: [true, 'Role is required']
  },
  region: {
    type: String,
    trim: true,
    required: function() {
      return this.role === 'AUTHORITY' || this.role === 'DOCTOR';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  refreshToken: {
    type: String,
    select: false
  },
  // Doctor-specific fields
  licenseNumber: {
    type: String,
    trim: true,
    required: function() {
      return this.role === 'DOCTOR';
    }
  },
  specialization: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  location: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    }
  },
  // Doctor profile questions
  profileQuestions: {
    yearsOfExperience: {
      type: Number,
      min: 0
    },
    languages: [{
      type: String,
      trim: true
    }],
    consultationFee: {
      type: Number,
      min: 0
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '18:00'
      }
    },
    consultationDuration: {
      type: Number,
      default: 30,
      min: 15
    },
    acceptsNewPatients: {
      type: Boolean,
      default: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    education: [{
      degree: String,
      institution: String,
      year: Number
    }],
    certifications: [{
      name: String,
      issuingOrganization: String,
      year: Number
    }]
  },
  // Secretary-specific field (which doctor they work for)
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'SECRETARY';
    }
  },
  // Patient-specific fields
  dateOfBirth: {
    type: Date
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  // Association fields (if needed)
  associationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Association'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

export default User;
