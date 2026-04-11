if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking");
const adminRouter = require("./routes/admin.js");

// MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    // crypto: {
    //     secret: process.env.SECRET || "fallbacksecret",
    // },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOption = {
    store:store,
   secret: process.env.SECRET || "mysupersecretcode",
     resave: false,
  saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
};

// app.get("/", (req, res) => {
//     res.send("i m root");
// });

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// app.use(require("morgan")("dev"));
// app.use(helmet());
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//     standardHeaders: true,
//     legacyHeaders: false,
// });
// app.use(limiter);
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  res.locals.successMessage = req.session.successMessage;
  delete req.session.successMessage;

  res.locals.currUser = req.user;
  next();
});


app.get("/", (req, res) => {
  res.redirect("/listings");
});
app.use("/users", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

app.use("/bookings", bookingRouter);

app.use("/admin", adminRouter);


// app.get("/testlisting", async (req, res) => {
//     let samplelisting = new Listing({
//         title: "my new villa",
//         description: "by the beach",
//         price: 1200,
//         location: "Calangote, Goa",
//         country: "India"
//     });
//     await samplelisting.save()
//     console.log("sample was saved");
//     res.send("succesfully tested");
// });

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found"));
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log("server is listening at 8080 port");
});