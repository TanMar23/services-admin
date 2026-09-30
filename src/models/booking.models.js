import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  services: [
    {
      service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
});

export default mongoose.model('Booking', bookingSchema);
