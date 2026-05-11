const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.js");
const { isLoggedIn, isAdmin } = require("../middleware.js");

// Dashboard
router.get("/", isLoggedIn, isAdmin, adminController.getDashboard);

// Users
router.get("/users/:id", isLoggedIn, isAdmin, adminController.getUserDetail);
router.delete("/users/:id", isLoggedIn, isAdmin, adminController.deleteUser);
// Toggle user role (user <-> admin)
router.patch("/users/:id/toggle-role", isLoggedIn, isAdmin, adminController.toggleUserRole);
// Listings
router.delete("/listings/:id", isLoggedIn, isAdmin, adminController.deleteListing);

// Bookings - all bookings page with optional ?status=filter
router.get("/bookings", isLoggedIn, isAdmin, adminController.getAllBookings);

// Update booking status (confirmed / pending / failed / cancelled)
router.patch("/bookings/:id/status", isLoggedIn, isAdmin, adminController.updateBookingStatus);

// Cancel a booking (shortcut route)
router.patch("/bookings/:id/cancel", isLoggedIn, isAdmin, adminController.cancelBooking);

module.exports = router;
