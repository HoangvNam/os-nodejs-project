import { BookingController, authenticate } from "../controllers/controllers.Booking.js"


export function routeBooking(app) {
    app.post("/view-book/:id", authenticate,BookingController.bookRoom)
    app.get("/my-bookings", authenticate,BookingController.myBookings)
    app.post("/my-bookings/:id", authenticate,BookingController.cancelBooking)
    app.get("/view-book/:id", authenticate,BookingController.bookview)
}