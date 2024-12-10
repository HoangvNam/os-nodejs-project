import { BookingController, authenticate } from "../controllers/controllers.Booking.js"


export function routeBooking(app) {
    app.post("/book", authenticate, BookingController.bookRoom)
    app.get("/my-bookings", authenticate, BookingController.myBookings)
    app.delete("/cancel/:bookingId", authenticate, BookingController.cancelBooking)
}