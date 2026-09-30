import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // duración en minutos
  duration: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: [String],
  },
  available: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model('Service', serviceSchema);
