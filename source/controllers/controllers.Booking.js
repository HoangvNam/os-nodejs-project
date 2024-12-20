import Booking from "../models/models.Booking.js"
import Room from "../models/models.Room.js"
import jwt from "jsonwebtoken"
import { SECRET_KEY } from "../index.js"


export const authenticate = (req, res, next) => {
    const token = req.cookies?.token

    if (!token) {
        return res.redirect("/login")
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
    static bookview(req, res) {

        res.render("user-booking", { message: "" })
    }
    static async bookRoom(req, res) {
        try {
            const { date, time, guests } = req.body;
            const roomID = req.params.id;  // roomID được truyền dưới dạng tham số trong URL
            if (!req.user || !req.user.id) {
                return res.status(400).render("user-booking", { message: "USER NOT AUTHEN" })
            }
            const username = req.user.username;
            // Kiểm tra giá trị roomID

            // Sử dụng `findById` thay vì `find`
            const room = await Room.findById(roomID);  // Truy vấn đúng cách

            if (!room || room.status !== "available") {
                return res.status(400).render("user-booking", { message: "Room is not available booking" })
            }

            // Tạo và lưu thông tin đặt phòng
            const booking = new Booking({ user: username, room: room.roomNumber, date, time, guests });
            await booking.save();

            // Cập nhật trạng thái phòng
            room.status = "occupied";
            await room.save();

            res.redirect("/my-bookings");  // Chuyển hướng tới trang đặt phòng của người dùng
        } catch (error) {
            res.status(500).render("user-booking", { message: "Number of people must be less than 6", error: error.message });
        }
    }


    static async myBookings(req, res) {
        try {
            const userId = req.user.username; // Lấy username của người dùng từ req.user

            // Lấy danh sách booking của người dùng hiện tại
            const bookings = await Booking.find({}).lean();

            // Render trang danh sách đặt phòng của người dùng
            res.render("my-bookings", {
                bookings,
                title: "My Bookings", // Thêm tiêu đề cho trang

            });
        } catch (error) {
            console.error("Error while retrieving bookings:", error);
            res.status(500).json({ message: "Failed to retrieve bookings!", error: error.message });
        }
    }

    static async cancelBooking(req, res) {
        try {
            const bookingId = req.params; // Lấy bookingId từ route params
            const userId = req.user.username; // Lấy thông tin user từ req.user

            // Tìm booking dựa trên userId và bookingId để xác minh quyền sở hữu
            const booking = await Booking.findOne({ _id: bookingId.id });

            if (!booking) {
                return res.status(404).json({
                    message: "Booking not found or you do not have permission to cancel this booking!"
                });
            }

            // Tìm phòng tương ứng với roomNumber trong booking
            const room = await Room.findOne({ roomNumber: booking.room });

            if (room) {
                room.status = "available"; // Đặt lại trạng thái phòng thành "available"
                await room.save(); // Lưu thay đổi vào database
            }

            // Xóa booking sau khi xử lý phòng
            await booking.deleteOne();

            // Thêm thông báo thành công qua query string
            res.redirect("/my-bookings");
        } catch (error) {
            console.error("Error while canceling booking:", error);
            res.status(500).json({ message: "Failed to cancel booking!", error: error.message });
        }
    }
}