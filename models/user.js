const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    role: {                    
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);