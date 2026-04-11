
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

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
      Booking.find().sort({ createdAt: -1 }).limit(5)
        .populate("user", "username")
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

// User delete
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

// Listing delete
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