
const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const app = express();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const { isLoggedIn, validateListing } = require("../middleware.js");
const { isOwner } = require("../middleware.js");
const{ storage}=require("../cloudConfig.js")
const multer  = require('multer')
const upload = multer({storage })
const listingController=require("../controllers/listing.js");

//create rout
router.get("/new", isLoggedIn,wrapAsync( listingController.renderNewForm));

router.route("/")
//index route
.get(wrapAsync(listingController.index))
//ADD ROUT
.post(
  isLoggedIn,
  validateListing,
  upload.single('listing[image]'),
  wrapAsync(listingController.createNewListing)
)


router.route("/:id")
 //show rout
.get(
  wrapAsync(listingController.showListing)
)
//UPDATE ROUT
.put(
  isLoggedIn,
  isOwner,
   upload.single('listing[image]'),
  validateListing,
  wrapAsync(listingController.updateListing),
)
//delete route
.delete(
 
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing),
)

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

module.exports = router;
