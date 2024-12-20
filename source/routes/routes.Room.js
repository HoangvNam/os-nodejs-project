import { RoomController } from "../controllers/controllers.Room.js"
import { verifyAdminToken } from "../controllers/controllers.Admin.js"
import { BookingController, authenticate } from "../controllers/controllers.Booking.js"
import multer from "multer"
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Lưu ảnh vào thư mục public/images
        cb(null, path.join('source', 'public', 'images'));
    },
    filename: (req, file, cb) => {
        // Tên file sẽ bao gồm timestamp để tránh trùng lặp
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/; // Các định dạng ảnh được phép
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true); // Ảnh hợp lệ
        }
        cb('Error: Only images are allowed!'); // Lỗi khi file không phải ảnh
    },
});


export function routeRoom(app) {
    app.post("/delete-room/:id", verifyAdminToken,RoomController.deleteRoom)

    app.get("/create-room", verifyAdminToken, RoomController.showCreateRoom)
    app.post("/create-room", verifyAdminToken, upload.single('image'), RoomController.createRoom)

    app.get("/edit-room/:id", verifyAdminToken, RoomController.showEditRoom)
    app.post("/edit-room/:id",verifyAdminToken, RoomController.updateRoom)

    app.get("/rooms",verifyAdminToken,RoomController.rooms)
    app.get("/user-rooms", RoomController.userrooms)
    app.get("/detail-room/:id", RoomController.detailRoom)
}