const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const ExpressError = require("../utils/ExpressError.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const {
  sendListingCreatedEmail,
  sendListingDeletedEmail,
} = require("../utils/sendEmail");

const Booking = require("../models/booking.js");
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ================= INDEX =================
module.exports.index = async (req, res) => {
  try {
    let { search } = req.query;
    let filter = {};

    if (search && search.trim() !== "") {
      const categories = ["Trending", "Rooms", "Mountain", "Camping", "Farms"];

      if (categories.includes(search)) {
        filter = { category: search };
      } else {
        const escapeRegex = (text) =>
          text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

        const safeSearch = escapeRegex(search);

        filter = {
          $or: [
            { title: { $regex: safeSearch, $options: "i" } },
            { location: { $regex: safeSearch, $options: "i" } },
            { country: { $regex: safeSearch, $options: "i" } },
          ],
        };
      }
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", { allListings, search });

  } catch (err) {
    console.error("Index error:", err);
    req.flash("error", "Failed to load listings");
    res.redirect("/listings");
  }
};


// ================= NEW FORM =================
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};


// ================= SHOW =================
module.exports.showListing = async (req, res) => {
  try {
    let { id } = req.params;

    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });

  } catch (err) {
    console.error("Show error:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/listings");
  }
};


// ================= CREATE =================
module.exports.createListing = async (req, res) => {
  try {
    if (!req.body.listing) {
      throw new ExpressError(400, "Invalid listing data");
    }

    // 🔥 GEOCODING
    const geoRes = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    if (!geoRes.body.features.length) {
      req.flash("error", "Invalid location");
      return res.redirect("/listings/new");
    }

    // 🔥 IMAGE CHECK
    if (!req.file) {
      req.flash("error", "Image required");
      return res.redirect("/listings/new");
    }

    const url = req.file.path;
    const filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = geoRes.body.features[0].geometry;

    const savedListing = await newListing.save();

    // 🔥 EMAIL (safe)
    try {
      await sendListingCreatedEmail(
        req.user.email,
        req.user.username,
        savedListing
      );
    } catch (e) {
      console.error("Listing created email failed:", e.message);
    }

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");

  } catch (err) {
    console.error("Create error:", err);
    req.flash("error", err.message);
    res.redirect("/listings/new");
  }
};


// ================= EDIT FORM =================
module.exports.renderEditForm = async (req, res) => {
  try {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
    }

    // 🔥 AUTH CHECK
    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "Unauthorized");
      return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url.replace(
      "/upload",
      "/upload/w_250"
    );

    res.render("listings/edit.ejs", { listing, originalImageUrl });

  } catch (err) {
    console.error("Edit form error:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/listings");
  }
};


// ================= UPDATE =================
module.exports.updateListing = async (req, res) => {
  try {
    let { id } = req.params;

    if (!req.body.listing) {
      throw new ExpressError(400, "Invalid listing data");
    }

    let listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // 🔥 AUTH CHECK
    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "Unauthorized");
      return res.redirect("/listings");
    }

    // UPDATE
    listing = await Listing.findByIdAndUpdate(id, req.body.listing, {
      new: true,
    });

    // IMAGE UPDATE
    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
      await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);

  } catch (err) {
    console.error("Update error:", err);
    req.flash("error", "Update failed");
    res.redirect("/listings");
  }
};


// ================= DELETE =================
module.exports.destroyListing = async (req, res) => {
  try {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // 🔥 AUTH CHECK
    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "Unauthorized");
      return res.redirect("/listings");
    }

    await Listing.findByIdAndDelete(id);

    // 🔥 EMAIL
    try {
      await sendListingDeletedEmail(
        req.user.email,
        req.user.username,
        listing.title
      );
    } catch (e) {
      console.error("Listing delete email failed:", e.message);
    }

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");

  } catch (err) {
    console.error("Delete error:", err);
    req.flash("error", "Delete failed");
    res.redirect("/listings");
  }
};


// ================= CREATE ORDER =================
module.exports.createOrder = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const { checkIn, checkOut } = req.body;

    // ✅ VALIDATION
    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "Dates required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      return res.status(400).json({ error: "Invalid dates" });
    }

    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    if (nights < 1) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    const totalAmount = listing.price * nights;

    // 🔥 PREVENT DOUBLE BOOKING
    const existingBooking = await Booking.findOne({
      listing: listing._id,
      status: "confirmed",
      $or: [
        {
          checkIn: { $lte: checkOutDate },
          checkOut: { $gte: checkInDate },
        },
      ],
    });

    if (existingBooking) {
      return res.status(400).json({
        error: "Selected dates already booked",
      });
    }

    // 🔥 CREATE RAZORPAY ORDER
    const order = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    console.log("order id=" + order.id);

    // 🔥 SAVE BOOKING (PENDING)
    const booking = await Booking.create({
      listing: listing._id,
      user: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      totalAmount,
      razorpayOrderId: order.id,
      status: "pending",
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking._id,
      keyId: process.env.RAZORPAY_KEY_ID,
      listing: { title: listing.title },
      user: { name: req.user.username, email: req.user.email },
    });

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
};
