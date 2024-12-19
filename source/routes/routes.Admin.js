import { AdminController, verifyAdminToken } from "../controllers/controllers.Admin.js"


export function routeAdmin(app) {
    app.post("/admin-register", AdminController.register)
    app.post("/admin-login",AdminController.login)
    app.get("/admin-register",AdminController.showRegister)
    app.get("/admin-login",AdminController.showLogin)

    app.post("/admin/delete-user/:id",  verifyAdminToken,AdminController.deleteUser)
    app.post("/admin/edit-user/:id", verifyAdminToken,AdminController.updateUser)
    app.get("/admin/edit-user/:id",  verifyAdminToken,AdminController.showEditUser)
    app.get("/admin/users", verifyAdminToken,AdminController.showUsers)

    app.get("/admin/dashboard",verifyAdminToken, AdminController.adminDashboard)
    app.get("/admin/add-user",verifyAdminToken, AdminController.addUserDisplay)
    app.post("/admin/add-user",verifyAdminToken, AdminController.addUser)

}