const mongoose = require("mongoose");
const Review = require("./review.js");
const { string } = require("joi");
const Schema = mongoose.Schema;

const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,

  category: {
    type: String,
    enum: ["Trending", "Rooms", "Mountain", "Camping", "Farms"],
  },
    reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      // required: true,
    },
    coordinates: {
      type: [Number],
      // required: true,
    },
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
  
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;