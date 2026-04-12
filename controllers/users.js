const User = require("../models/user.js");
const Booking = require("../models/booking.js");

const {
  sendWelcomeEmail,
  sendLoginEmail,
  sendProfileUpdateEmail,
} = require("../utils/sendEmail.js");


// ================= SIGNUP =================
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // ✅ VALIDATION
    if (!username || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/users/signup");
    }

    // ✅ CREATE USER
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    // ✅ AUTO LOGIN
    req.login(registeredUser, async (err) => {
      if (err) return next(err);

      // ✅ EMAIL (non-blocking safe)
      try {
        await sendWelcomeEmail(email, username);
      } catch (e) {
        console.error("Signup email failed:", e.message);
      }

      req.flash("success", `Welcome ${username}!`);
      res.redirect("/listings");
    });

  } catch (e) {
    console.error("Signup error:", e.message);

    // duplicate email/username case
    console.log(e.message);
    req.flash("error", e.message);
    res.redirect("/users/signup");
  }
};


// ================= LOGIN =================
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  try {
    // ⚠️ optional email (can be removed in heavy traffic apps)
    try {
      await sendLoginEmail(req.user.email, req.user.username);
    } catch (e) {
      console.error("Login email failed:", e.message);
    }

    req.flash("success", "Welcome back!");

    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);

  } catch (err) {
    console.error("Login error:", err);
    req.flash("error", "Login failed");
    res.redirect("/login");
  }
};


// ================= LOGOUT =================
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
};


// ================= PROFILE =================
module.exports.getProfile = async (req, res) => {
  try {
    // ✅ fetch bookings (optimized)
    if(!req.user) {
      req.flash("error", "Please log in to view profile");
      return res.redirect("/users/login");
    }
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing", "title location price")
      .sort({ createdAt: -1 });

    res.render("users/profile.ejs", {
      user: req.user,
      bookings,
    });

  } catch (err) {
    console.error("Profile load error:", err);
    req.flash("error", "Unable to load profile");
    res.redirect("/users/listings");
  }
};


// ================= UPDATE PROFILE =================
module.exports.updateProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;

    if (!username || !email) {
      req.flash("error", "All fields required");
      return res.redirect("/users/my-profile");
    }

    // ✅ UPDATE USERNAME + EMAIL
    await User.findByIdAndUpdate(
      req.user._id,
      { username, email },
      { new: true, runValidators: true }
    );

    // ✅ PASSWORD CHANGE (only if user filled it)
    if (currentPassword && newPassword) {
      const user = await User.findById(req.user._id);

      // passport-local-mongoose ka built-in method
      await user.changePassword(currentPassword, newPassword);
    }

    try {
      await sendProfileUpdateEmail(email, username);
    } catch (e) {
      console.error("Profile update email failed:", e.message);
    }

    req.flash("success", "Profile updated successfully!");
    res.redirect("/users/my-profile");

  } catch (err) {
    console.error("Profile update error:", err);

    // Wrong current password case
    if (err.name === "IncorrectPasswordError") {
      req.flash("error", "Current password is incorrect");
    } else {
      req.flash("error", "Update failed");
    }
    res.redirect("/users/my-profile");
  }
};