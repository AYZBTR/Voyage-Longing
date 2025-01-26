const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");


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
  saveUninitialized: true
};

app.use(session(sessionOptions));

app.get("/", (req, res) => {
  res.send("Hi, from Root!");
});


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
