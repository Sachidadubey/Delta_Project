const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const { sendBookingConfirmationEmail } = require("../utils/sendEmail.js");

// ================= RAZORPAY INSTANCE =================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================= SHOW BOOKING FORM =================
module.exports.renderBookingForm = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      req.flash("error", "Invalid request");
      return res.redirect("/listings");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    res.render("bookings/new.ejs", { listing });

  } catch (err) {
    console.error("Render booking error:", err.message);
    req.flash("error", "Something went wrong");
    res.redirect("/listings");
  }
};

// ================= VERIFY PAYMENT =================
module.exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // ================= VALIDATION =================
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      console.warn("❌ Missing payment data:", req.body);

      return res.json({
        success: false,
        message: "Missing payment details",
      });
    }

    // ================= SIGNATURE VERIFY =================
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Debug logs (safe)
    console.log("🧾 VERIFY DEBUG:");
    console.log("ORDER:", razorpay_order_id);
    console.log("PAYMENT:", razorpay_payment_id);
    console.log("EXPECTED:", expectedSignature);
    console.log("RECEIVED:", razorpay_signature);

    // ================= INVALID PAYMENT =================
    if (expectedSignature !== razorpay_signature) {
      await Booking.findByIdAndUpdate(bookingId, { status: "failed" });

      return res.json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // ================= SECURITY CHECK =================
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
    }).populate("listing");

    if (!booking) {
      console.warn("❌ Unauthorized booking access");

      return res.status(403).json({
        success: false,
        message: "Unauthorized booking",
      });
    }

    // ================= UPDATE BOOKING =================
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.status = "confirmed";

    await booking.save();

    // ================= EMAIL =================
    try {
      await sendBookingConfirmationEmail(
        req.user.email,
        req.user.username,
        {
          listingTitle: booking.listing.title,
          location: `${booking.listing.location}, ${booking.listing.country}`,
          checkIn: booking.checkIn.toDateString(),
          checkOut: booking.checkOut.toDateString(),
          amount: booking.totalAmount,
          paymentId: razorpay_payment_id,
        }
      );
    } catch (emailErr) {
      console.error("📧 Email failed:", emailErr.message);
      // Don't break flow
    }

    // ================= SUCCESS FLASH =================
    req.session.successMessage = "🎉 Booking confirmed! Check your email.";

    return req.session.save(() => {
      res.json({ success: true });
    });

  } catch (err) {
    console.error("🔥 VERIFY ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ================= MY BOOKINGS =================
module.exports.myBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing", "title location price image")
      .sort({ createdAt: -1 })
      .lean();

    res.render("bookings/my-bookings.ejs", { bookings });

  } catch (err) {
    console.error("My bookings error:", err.message);
    req.flash("error", "Failed to load bookings");
    res.redirect("/listings");
  }
};