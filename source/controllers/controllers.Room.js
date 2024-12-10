import Room from "../models/models.Room.js"


export class RoomController {
    static showCreateRoom(req, res) {
        res.render("admin-create-room", { title: "Create Room" })
    }   

    static async createRoom(req, res) {
        try {
            const { roomNumber, bedCount, status, price } = req.body

            const newRoom = new Room({ roomNumber, bedCount, status, price })
            await newRoom.save()

            res.status(201).json({
                message: "Room creation successful!",
                room: newRoom,
            })
        } catch (error) {
            res.status(400).json({
                message: "Room initialization failed!",
                error: error.message,
            })
        }
    }

    static async showEditRoom(req, res) {
        try {
            const { id } = req.params
            const room = await Room.findById(id).lean()
            if (!room) {
                return res.status(404).send("Room not found");
            }
            res.render("room-edit", { title: "Edit Room Information", room })
        } catch (error) {
            res.status(500).send("Error fetching user: " + error.message)
        }
    }

    static async updateRoom(req, res) {
        try {
            const { id } = req.params
            const updates = req.body

            const updatedRoom = await Room.findByIdAndUpdate(id, updates, {
                new: true,
                runValidators: true,
            })

            if (!updatedRoom) {
                return res.status(404).json({
                    message: "Room not found",
                })
            }

            res.redirect("/admin-rooms")
            // res.status(200).json({
            //     message: "Room updated successfully",
            //     room: updatedRoom,
            // })
        } catch (error) {
            res.status(400).json({
                message: "Failed to update room",
                error: error.message,
            })
        }
    }

    static async deleteRoom(req, res) {
        try {
            const { id } = req.params

            const deletedRoom = await Room.findByIdAndDelete(id)

            if (!deletedRoom) {
                return res.status(404).json({
                    message: "Room not found",
                })
            }

            res.redirect("/admin/rooms")
            // res.status(200).json({
            //     message: "Room deleted successfully",
            //     room: deletedRoom,
            // })
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete room",
                error: error.message,
            })
        }
    }

    static async rooms(req, res) {
        try {
            const rooms = await Room.find().lean()
            res.render("admin-rooms", { title: "Rooms", rooms })
            // res.status(200).json(rooms)
        } catch (error) {
            res.status(500).json({
                message: "Room information could not be retrieved!",
                error: error.message,
            })
        }
    }
}