const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// MIDDLEWARE: Validate Mongo ID
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    req.flash("error", "Invalid listing ID");
    return res.redirect("/listings");
  }
  next();
};

// ================= INDEX + CREATE =================
router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),  // ✅ pehle multer
    validateListing,                   // ✅ baad mein validate
    wrapAsync(listingController.createListing)
  );

// ================= NEW =================
router.get("/new", isLoggedIn, listingController.renderNewForm);

// ================= SHOW + DELETE =================
router.route("/:id")
  .get(validateId, wrapAsync(listingController.showListing))
  .delete(
    validateId,
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );

// ================= EDIT + UPDATE =================
router.route("/:id/edit")
  .get(
    validateId,
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
  )
 .put(
    validateId,
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),  // ✅ pehle
    validateListing,                   // ✅ baad mein
    wrapAsync(listingController.updateListing)
);
// create order--
  // Create Razorpay order (AJAX)
router.post("/:id/create-order", isLoggedIn, wrapAsync(listingController.createOrder));


module.exports = router;