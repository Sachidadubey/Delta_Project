const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔥 COMMON TEMPLATE
const emailTemplate = (title, content, buttonText = "Explore", link = process.env.APP_URL) => {
  return `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:2rem;border:1px solid #e2e8f0;border-radius:12px;">
      <h2 style="color:#fe424d;">${title}</h2>

      <div style="margin:1rem 0;">
        ${content}
      </div>

      <a href="${link}"
         style="display:inline-block;margin-top:1rem;padding:0.6rem 1.5rem;background:#0f172a;color:#fff;border-radius:2rem;text-decoration:none;">
        ${buttonText}
      </a>

      <p style="margin-top:2rem;color:#94a3b8;font-size:0.85rem;">
        © Wanderlust
      </p>
    </div>
  `;
};

// ✅ EMAIL FUNCTIONS
module.exports = {
  sendWelcomeEmail: async (email, username) => {
    await transporter.sendMail({
      to: email,
      subject: "Welcome 🎉",
      html: emailTemplate(`Welcome ${username}!`, `<p>Your account is ready.</p>`),
    });
  },

  sendLoginEmail: async (email, username) => {
    await transporter.sendMail({
      to: email,
      subject: "Login Alert",
      html: emailTemplate(`Hi ${username}`, `<p>You logged in.</p>`),
    });
  },

  sendProfileUpdateEmail: async (email, username) => {
    await transporter.sendMail({
      to: email,
      subject: "Profile Updated",
      html: emailTemplate("Profile Updated", `<p>${username}, your profile was updated.</p>`),
    });
  },

  sendListingCreatedEmail: async (email, username, listing) => {
    await transporter.sendMail({
      to: email,
      subject: "Listing Created",
      html: emailTemplate("Listing Live 🏡", `<p>${listing.title} is now live.</p>`),
    });
  },

  sendListingDeletedEmail: async (email, username, title) => {
    await transporter.sendMail({
      to: email,
      subject: "Listing Deleted",
      html: emailTemplate("Listing Deleted", `<p>${title} removed.</p>`),
    });
  },

  sendBookingConfirmationEmail: async (email, username, booking) => {
    await transporter.sendMail({
      to: email,
      subject: "Booking Confirmed ✅",
      html: emailTemplate(
        "Booking Confirmed",
        `<p><b>${booking.listingTitle}</b></p>
         <p>${booking.checkIn} → ${booking.checkOut}</p>
         <p>₹${booking.amount}</p>`
      ),
    });
  },
};