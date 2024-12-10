import { RoomController } from "../controllers/controllers.Room.js"
import { verifyAdminToken } from "../controllers/controllers.Admin.js"


export function routeRoom(app) {
    app.post("/delete-room/:id", verifyAdminToken, RoomController.deleteRoom)

    app.get("/create-room", verifyAdminToken, RoomController.showCreateRoom)
    app.post("/create-room", verifyAdminToken, RoomController.createRoom)

    app.get("/edit-room/:id", verifyAdminToken, RoomController.showEditRoom)
    app.post("/edit-room/:id", verifyAdminToken, RoomController.updateRoom)
}