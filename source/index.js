import mongoose from "mongoose"
import express from "express"
import cookieParser from "cookie-parser"
import path from "path"
import morgan from "morgan"
import { fileURLToPath } from "url"
import { configDotenv } from "dotenv"
import { routeRoom } from "./routes/routes.Room.js"
import { routeUser } from "./routes/routes.User.js"
import { routeBooking } from "./routes/routes.Booking.js"
import { routeAdmin } from "./routes/routes.Admin.js"





// ----------------------------------------------------------------------------


export class HP {
    static __filename = fileURLToPath(import.meta.url)
    static __dirname = path.dirname(this.__filename)
}


// ----------------------------------------------------------------------------


// Configure mongodb
configDotenv({path: path.join(HP.__dirname, ".env")})
const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT || 4000
export const SECRET_KEY = process.env.SECRET_KEY

mongoose
    .connect(MONGODB_URI, {serverSelectionTimeoutMS: 30000})
    .then(() => console.log("You successfully connected to MongoDB!"))
    .catch((err) => console.error("MongoDB connection error: ", err))


// ----------------------------------------------------------------------------


// Configure application
const app = express()


// ----------------------------------------------------------------------------


// Configure ejs
app.set("view engine", "ejs")
app.set("views", path.join(HP.__dirname, "views"))

// ----------------------------------------------------------------------------


// Configure static files
// app.use(express.static(path.join(HP.__dirname, "uploads")))
app.use('/images', express.static(path.join(HP.__dirname, 'public', 'images')));


// ----------------------------------------------------------------------------


// More configre
app.use(morgan("combined"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())


// ----------------------------------------------------------------------------


// Configure routes
routeRoom(app)
routeUser(app)
routeBooking(app)
routeAdmin(app)


// ----------------------------------------------------------------------------


// Run application
app.listen(PORT, () => {console.log(`The server is running at http://localhost:${PORT}/login`)})


// ----------------------------------------------------------------------------