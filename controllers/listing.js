const Listing= require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm= async(req, res) => {
  res.render("listings/new.ejs");
}

module.exports.createNewListing = async (req, res) => {

  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  }).send();

  let listingData = req.body.listing;

  const newListing = new Listing(listingData);
  newListing.owner = req.user._id;

  // Image upload
  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { url, filename };
  }

  // Geometry check
  if (response.body.features.length > 0) {
    newListing.geometry = response.body.features[0].geometry;
  } else {
    req.flash("error", "Location not found");
    return res.redirect("/listings/new");
  }

  await newListing.save();

  req.flash("success", "New listing created!");
  res.redirect("/listings");
};
  module.exports.showListing=async (req, res) => {
      let { id } = req.params;
      const listings = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");
      if (!Listing) {
        req.flash("error", "listing not exist!");
        res.redirect("/listings");
      }
      res.render("listings/show.ejs", { listings });
    }

    module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listings = await Listing.findById(id);
    let originalImage=listings.image.url;
    originalImage.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listings,originalImage });
  }

  module.exports.updateListing=async (req, res) => {
      let { id } = req.params;
  
      let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
      if(typeof req.file !== "undefined"){
       let url=req.file.path;
       let filename=req.file.filename;
       listing.image={url, filename};
       await listing.save();
      }
      
      req.flash("success", " listing updated!");
      res.redirect(`/listings/${id}`);
    }

    module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", " listing deleted successfully!");
    res.redirect("/listings");
  }