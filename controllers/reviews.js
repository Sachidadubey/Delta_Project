const Listing = require("../models/listing");
const Review = require("../models/review");

// ================= DELETE REVIEW =================
module.exports.destroyReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("Destroy Review Error:", err);
    req.flash("error", "Failed to delete review");
    res.redirect(`/listings/${req.params.id}`);
  }
};

// ================= CREATE REVIEW =================
module.exports.createReview = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error("Create Review Error:", err);
    req.flash("error", "Failed to create review");
    res.redirect(`/listings/${req.params.id}`);
  }
};