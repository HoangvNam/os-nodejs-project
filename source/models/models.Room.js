import mongoose from "mongoose"


const RoomSchema = new mongoose.Schema({
    roomNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    bedCount: {
        type: Number,
        required: true,
        min: [1, 'Number of beds must be at least 1'],
    },
    status: {
        type: String,
        required: true,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available',
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Room price must be greater than or equal to 0'],
    },
})


const Room = mongoose.model('Room', RoomSchema)
export default Room