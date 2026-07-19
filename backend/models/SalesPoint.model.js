import mongoose from 'mongoose';

const salesPointSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the sales point'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
    trim: true
  },
  latitude: {
    type: Number,
    required: [true, 'Please provide latitude']
  },
  longitude: {
    type: Number,
    required: [true, 'Please provide longitude']
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  pointType: {
    type: String,
    enum: ['STORE', 'PHARMACY', 'RESTAURANT', 'DEFAULT'],
    default: 'STORE'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const SalesPoint = mongoose.model('SalesPoint', salesPointSchema);

export default SalesPoint;
