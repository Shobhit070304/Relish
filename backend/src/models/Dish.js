import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema({
  dishId: { type: String, required: true, unique: true, trim: true },
  dishName: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isPublished: { type: Boolean, required: true },
  version: { type: Number, required: true, min: 1 }
}, { timestamps: true });

export const Dish = mongoose.model('Dish', dishSchema);
