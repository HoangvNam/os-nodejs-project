import Booking from "../models/models.Booking.js"
import Room from "../models/models.Room.js"
import jwt from "jsonwebtoken"
import { SECRET_KEY } from "../index.js"


export const authenticate = (req, res, next) => {
    const token = req.cookies?.token

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No Token Provided!" })
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY)
        req.user = decoded
        next()
    } catch (error) {
        res.status(400).json({ message: "Invalid Token!" })
    }
}


export class BookingController {
    static async bookRoom(req, res) {
        try {
            const { roomNumber, date, time, guests } = req.body

            if (!req.user || !req.user.id) {
                return res.status(400).json({ message: "User not authenticated!" });
            }
            const userId = req.user.id

            const room = await Room.findOne({ roomNumber: roomNumber })

            if (!room || room.status !== "available") {
                return res.status(400).json({ message: "Room is not available for booking!" })
            }

            const booking = new Booking({ user: userId, room: roomNumber, date, time, guests })
            await booking.save()

            room.status = "occupied"
            await room.save()

            res.status(201).json({
                message: "Room booked successfully!",
                booking,
            })
        } catch (error) {
            res.status(500).json({ message: "Failed to book room!", error: error.message })
        }
    }

    static async myBookings(req, res) {
        try {
            const userId = req.user.id
            const bookings = await Booking.find({ user: userId })
                .populate("room", "roomNumber")
                .lean()

            res.status(200).json(bookings)
        } catch (error) {
            res.status(500).json({ message: "Failed to retrieve bookings!", error: error.message })
        }
    }

    static async cancelBooking(req, res) {
        try {
            const { bookingId } = req.params;
            const userId = req.user.id

            const booking = await Booking.findOne({ _id: bookingId, user: userId })
            if (!booking) {
                return res.status(404).json({ message: "Booking not found!" })
            }

            const room = await Room.findById(booking.room)
            if (room) {
                room.status = "available"
                await room.save();
            }
            await booking.deleteOne()

            res.status(200).json({ message: "Booking cancelled successfully!" })
        } catch (error) {
            res.status(500).json({ message: "Failed to cancel booking!", error: error.message })
        }
    }
}