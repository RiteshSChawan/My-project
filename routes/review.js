const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
//reviews
router.post("/:id/reviews",isLoggedIn, validateReview, 
    wrapAsync(reviewController.createReview));


//delete review
router.delete("/:id/reviews/:reviewId",isLoggedIn,isReviewAuthor, 
    wrapAsync(reviewController.deleteReview));

module.exports=router;

