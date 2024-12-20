import Room from "../models/models.Room.js"




export class RoomController {
    static showCreateRoom(req, res) {
        res.render("room-create", { message: "" })
    }


    static async createRoom(req, res) {
        try {
            const { roomNumber, bedCount, status, price } = req.body;

            // Kiểm tra trùng số phòng
            const roomExists = await Room.findOne({ roomNumber });
            if (roomExists) {
                return res.render("room-create", { message: "Room number already exists" });
            }

            // Kiểm tra và lưu ảnh (nếu có)
            let image = '';
            if (req.file) {
                image = req.file.path;
            }

            // Tạo phòng mới
            const newRoom = new Room({ roomNumber, bedCount, status, price, image });
            await newRoom.save();

            // Chuyển hướng đến trang danh sách phòng
            res.redirect("/rooms");
        } catch (error) {
            // Hiển thị thông báo lỗi nếu có lỗi xảy ra
            res.render("room-create", { message: error.message });
        }
    }

    static async showEditRoom(req, res) {
        try {
            const { id } = req.params
            const room = await Room.findById(id).lean()
            if (!room) {
                return res.render("room-edit", { message: "Room not found" }, room);
            }
            res.render("room-edit", { message: "", room })
        } catch (error) {
            res.status(500).json({
                message: error.message,

            })
        }
    }

    static async updateRoom(req, res) {
        try {
            const { id } = req.params
            const updates = req.body

            const room = await Room.findByIdAndUpdate(id, updates, {
                new: true,
                runValidators: true,
            })

            if (!room) {
                return res.render("room-edit", {
                    message: "Room not found", room
                })
            }

            res.redirect("/rooms")
        } catch (error) {
            res.status(500).json({
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

            res.redirect("/rooms")

        } catch (error) {
            res.status(500).json({
                message: "Failed to delete room",
                error: error.message,
            })
        }
    }

    static async rooms(req, res) {
        try {
            // Lấy giá trị tìm kiếm từ query parameters
            const searchQuery = req.query.search || ''; // Lấy từ query hoặc mặc định là rỗng

            // Lấy trang hiện tại từ query parameters (mặc định là trang 1)
            const page = parseInt(req.query.page) || 1;
            const perPage = 10; // Số lượng phòng mỗi trang

            // Tính toán số phòng cần bỏ qua dựa trên trang hiện tại
            const skip = (page - 1) * perPage;

            // Tìm kiếm theo tiêu chí 'roomNumber' hoặc 'status' hoặc 'bedCount'
            const filter = {

            };
            if (!isNaN(searchQuery) && Number(searchQuery) > 0) {
                filter.roomNumber = Number(searchQuery); // Lọc theo số phòng
            }
            // Nếu tìm kiếm là trạng thái
            else if (['available', 'occupied', 'maintenance'].includes(searchQuery.toLowerCase())) {
                filter.status = searchQuery.toLowerCase(); // Lọc theo trạng thái
            }

            // Fetch rooms với phân trang và tìm kiếm
            const rooms = await Room.find(filter).skip(skip).limit(perPage).lean();

            // Đếm tổng số phòng để tính phân trang
            const totalRooms = await Room.countDocuments(filter);

            // Tính tổng số trang
            const totalPages = Math.ceil(totalRooms / perPage);

            // Render lại trang với dữ liệu phân trang và kết quả tìm kiếm
            res.render("admin-rooms", {
                title: "Rooms",
                rooms,
                currentPage: page,
                totalPages,
                totalRooms,
                searchQuery // Truyền lại giá trị tìm kiếm vào template
            });
        } catch (error) {
            res.status(500).json({
                message: "Room information could not be retrieved!",
                error: error.message,
            });
        }
    }

    static async userrooms(req, res) {
        try {
            const user = req.cookies.user || null;
            const page = parseInt(req.query.page) || 1;
            const perPage = 10; // Number of rooms per page
            const skip = (page - 1) * perPage;

            // Lấy giá trị tìm kiếm từ query string
            const searchQuery = req.query.search || '';
            let filter = {};

            // Nếu tìm kiếm là số dương
            if (!isNaN(searchQuery) && Number(searchQuery) > 0) {
                filter.roomNumber = Number(searchQuery); // Lọc theo số phòng
            }
            // Nếu tìm kiếm là trạng thái
            else if (['available', 'occupied', 'maintenance'].includes(searchQuery.toLowerCase())) {
                filter.status = searchQuery.toLowerCase(); // Lọc theo trạng thái
            }

            // Fetch rooms với điều kiện lọc và phân trang
            const rooms = await Room.find(filter).skip(skip).limit(perPage).lean();
            const totalRooms = await Room.countDocuments(filter);
            const totalPages = Math.ceil(totalRooms / perPage);

            res.render("user-rooms", {
                title: "Rooms",
                rooms,
                currentPage: page,
                totalPages,
                totalRooms,
                user,
                searchQuery,
            });
        } catch (error) {
            res.status(500).json({
                message: "Room information could not be retrieved!",
                error: error.message,
            });
        }
    }
    static async detailRoom(req, res) {
        try {
            const room = await Room.findById(req.params.id); // Tìm phòng dựa trên _id
            if (!room) {
                return res.status(404).send('Room not found'); // Xử lý khi không tìm thấy phòng
            }

            const rooms = {
                ...room._doc,
                imagePath: `${room.image}` // Đường dẫn tới file ảnh
            };
            console.log(rooms.image)

            res.render('room-detail', { rooms }); // Render giao diện chi tiết phòng
        } catch (error) {
            res.status(500).send('Internal Server Error'); // Xử lý lỗi server
        }
    }
}