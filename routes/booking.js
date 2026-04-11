const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// Booking form
router.get("/listings/:id/book", isLoggedIn, wrapAsync(bookingController.renderBookingForm));


// Verify payment after Razorpay callback
router.post("/verify-payment", isLoggedIn, wrapAsync(bookingController.verifyPayment));


// My bookings
router.get("/my-bookings", isLoggedIn, wrapAsync(bookingController.myBookings));

module.exports = router;