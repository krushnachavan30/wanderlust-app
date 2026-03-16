const dotenv = require('dotenv')
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const app = express();
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const listings = require("./routes/listing.js");
const reviewss = require("./routes/review.js");
const userRouter=require("./routes/user.js");
const session= require("express-session")
const MongoStore = require("connect-mongo")
const flash=require("connect-flash")
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js")
const {isLoggedIn}=require("./middleware.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const dbUrl=process.env.ATLAS_DB;
console.log(dbUrl)
async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");
  } catch (err) {
    console.log("Database connection error:", err);
  }
}

main();
  
const store= MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:"mysecret",
  },
  touchAfter:24 * 3600,
});
store.on("error",()=>{
  console.log("error in mongo session store", error)
})
const sessionOptions={
  store,
  secret:"mysecret",
  resave: false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge:7 * 24 * 60 * 60 * 1000,
    httpOnly:true,

  },
}

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next)=> {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser=req.user;
  next();
});



passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/demouser",async(req,res)=> {
//   let fakeUser=new User({
//     email:"student@gmail.com",
//     username:"delta-student",
//   })

//   let registeredUser=await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// })

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviewss);
app.use("/", userRouter);
app.use((req, res, next) => {
  next(new ExpressError(404, "page not found"));
});
//server side validation middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "page not found !" } = err;
  if (err.name === "CastError") {
    // return res.status(404).send("Page Not Found");
    res.status(404).render("error.ejs", { message: "page not found" });
  } else {
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { message });
  }
});

app.listen(8080, () => {
  console.log("server listning on port 8080");
});
