import { UserController } from "../controllers/controllers.User.js"


export function routeUser(app) {
    app.post("/register", UserController.register)
    app.post("/login", UserController.login)

    app.get("/register", UserController.showRegister)
    app.get("/login", UserController.showLogin)
    app.get('/logout', UserController.logout);
}