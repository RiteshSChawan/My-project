const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    // 🚨 Check if listing is null
    if (!listing) {
        throw new ExpressError(404, "Listing not found.");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    
    await newReview.save();
    await listing.save();
    req.flash("success","Review created!");


    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // 🚨 Check if the listing exists
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found.");
    }

    // Remove review reference from the listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete review from the database
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted!");

    res.redirect(`/listings/${id}`);
};