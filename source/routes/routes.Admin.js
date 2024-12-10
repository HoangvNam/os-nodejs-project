import { AdminController, verifyAdminToken } from "../controllers/controllers.Admin.js"


export function routeAdmin(app) {
    app.post("/admin-register", AdminController.register)
    app.post("/admin-login", AdminController.login)
    app.get("/admin-register", AdminController.showRegister)
    app.get("/admin-login", AdminController.showLogin)

    app.post("/admin/delete-user/:id", verifyAdminToken, AdminController.deleteUser)
    app.post("/admin/edit-user/:id", AdminController.updateUser)
    app.get("/admin/edit-user/:id", verifyAdminToken, AdminController.showEditUser)
    app.get("/admin/users", verifyAdminToken, AdminController.showUsers)
}