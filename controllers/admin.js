const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
module.exports.getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      recentUsers,
      recentListings,
      recentBookings,
      revenue
    ] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "pending" }),
      User.find().sort({ createdAt: -1 }).limit(5),
      Listing.find().sort({ createdAt: -1 }).limit(5).populate("owner", "username"),
      Booking.find().sort({ createdAt: -1 }).limit(10)
        .populate("user", "username email")
        .populate("listing", "title"),
      Booking.aggregate([
        { $match: { status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    const totalRevenue = revenue[0]?.total || 0;

    res.render("admin/dashboard.ejs", {
      stats: { totalUsers, totalListings, totalBookings, confirmedBookings, pendingBookings, totalRevenue },
      recentUsers,
      recentListings,
      recentBookings
    });

  } catch (err) {
    console.error("Admin dashboard error:", err);
    req.flash("error", "Dashboard load failed");
    res.redirect("/listings");
  }
};

// ─── USER DETAIL ─────────────────────────────────────────────────────────────
module.exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin");
    }

    const bookings = await Booking.find({ user: user._id })
      .populate("listing", "title price location")
      .sort({ createdAt: -1 });

    const listings = await Listing.find({ owner: user._id }).sort({ createdAt: -1 });

    res.render("admin/user-detail.ejs", { user, bookings, listings });

  } catch (err) {
    console.error("User detail error:", err);
    req.flash("error", "Could not load user details");
    res.redirect("/admin");
  }
};

// ─── USER DELETE ─────────────────────────────────────────────────────────────
module.exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash("success", "User deleted!");
    res.redirect("/admin");
  } catch (err) {
    req.flash("error", "Delete failed");
    res.redirect("/admin");
  }
};

// ─── LISTING DELETE ───────────────────────────────────────────────────────────
module.exports.deleteListing = async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted!");
    res.redirect("/admin");
  } catch (err) {
    req.flash("error", "Delete failed");
    res.redirect("/admin");
  }
};

// ─── ALL BOOKINGS PAGE ────────────────────────────────────────────────────────
module.exports.getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const bookings = await Booking.find(filter)
      .populate("user", "username email")
      .populate("listing", "title price")
      .sort({ createdAt: -1 });

    res.render("admin/all-bookings.ejs", { bookings, currentFilter: status || "all" });

  } catch (err) {
    console.error("All bookings error:", err);
    req.flash("error", "Could not load bookings");
    res.redirect("/admin");
  }
};

// ─── UPDATE BOOKING STATUS ────────────────────────────────────────────────────
module.exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "confirmed", "failed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      req.flash("error", "Invalid status");
      return res.redirect("/admin/bookings");
    }

    await Booking.findByIdAndUpdate(id, { status });
    req.flash("success", `Booking status updated to "${status}"`);

    // redirect back to where admin came from
    const redirectTo = req.body.redirectTo || "/admin/bookings";
    res.redirect(redirectTo);

  } catch (err) {
    console.error("Update booking status error:", err);
    req.flash("error", "Could not update booking status");
    res.redirect("/admin/bookings");
  }
};

// ─── CANCEL BOOKING ───────────────────────────────────────────────────────────
module.exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/admin/bookings");
    }

    booking.status = "cancelled";
    await booking.save();

    req.flash("success", "Booking cancelled successfully");

    const redirectTo = req.body.redirectTo || "/admin/bookings";
    res.redirect(redirectTo);

  } catch (err) {
    console.error("Cancel booking error:", err);
    req.flash("error", "Could not cancel booking");
    res.redirect("/admin/bookings");
  }
};
// ─── TOGGLE USER ROLE ─────────────────────────────────────────────────────────
module.exports.toggleUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin");
    }

    // Apne aap ko admin se user nahi bana sakte
    if (user._id.equals(req.user._id)) {
      req.flash("error", "You cannot change your own role");
      return res.redirect("/admin");
    }

    // Toggle karo
    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    req.flash("success", `@${user.username} is now ${user.role}`);

    const redirectTo = req.body.redirectTo || "/admin";
    res.redirect(redirectTo);

  } catch (err) {
    console.error("Toggle role error:", err);
    req.flash("error", "Could not update role");
    res.redirect("/admin");
  }
};