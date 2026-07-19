import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the ingredient'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['FARINE', 'CEREALE', 'EPICE', 'LAITIER', 'FRUIT_SEC', 'ADDITIF', 'AUTRE'],
    default: 'AUTRE'
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price must be positive']
  },
  grammage: {
    type: Number,
    required: [true, 'Please provide a grammage (in grams)'],
    min: [1, 'Grammage must be positive']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

export default Ingredient;
