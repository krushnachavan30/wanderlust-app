const express=require("express");
const router = express.Router({ mergeParams: true });
const Listing=require("../models/listing.js")
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/expressError.js")

const Review=require("../models/review.js")  
const{validateReview, isLoggedIn, isReviewAuthor}=require("../middleware.js");
const reviewConstroller=require("../controllers/review.js");

        

//review
//post review
router.post("/",isLoggedIn,validateReview, wrapAsync(reviewConstroller.createReview))

//delete review rout
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewConstroller.destroyReview))
module.exports=router;
