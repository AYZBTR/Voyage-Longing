const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listings = require("./Routes/listing.js");
const reviews = require("./Routes/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/voyagelonging";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))


const sessionOptions = {
  secret: "Ap5!89jhcdajnch",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
};

app.get("/", (req, res) => {
  res.send("Hi, from Root!");
});

app.use(session(sessionOptions));
app.use(flash());

//authentication part
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
})

app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "fakeuser1@email.com",
    username: "Fakeuser-01"
  })

  let registeredUser = await User.register(fakeUser, "fakeuser1password")
  res.send(registeredUser);
})

// Mounting routers to handle requests for listings and reviews of specific listings by their ID.
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

//Error Handler Middlewares
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message })
  //res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("Server is listening to port 8080!");
});
