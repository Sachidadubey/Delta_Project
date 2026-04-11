
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.js");
const { isLoggedIn, isAdmin } = require("../middleware.js");

router.get("/", isLoggedIn, isAdmin, adminController.getDashboard);
router.delete("/users/:id", isLoggedIn, isAdmin, adminController.deleteUser);
router.delete("/listings/:id", isLoggedIn, isAdmin, adminController.deleteListing);

module.exports = router;