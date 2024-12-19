import mongoose from "mongoose";


const BookingSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
    required: true,
  },
  room: {
    type: Number,
    ref: "Room",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
    min: [1, "Number of guests must be at least 1"],
    max: [6, "Number of guests cannot exceed 6"],
  },
})

const Booking = mongoose.model("Booking", BookingSchema)
export default Booking
