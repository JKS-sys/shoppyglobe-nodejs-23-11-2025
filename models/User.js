const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
  },
  {
    timestamps: true,
  }
);

// FIXED: Hash password before saving user - using async/await without next
UserSchema.pre("save", async function () {
  // Only run if password was modified
  if (!this.isModified("password")) return;

  try {
    // Hash password with cost factor of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error("Error hashing password: " + error.message);
  }
});

// Alternative fix if above doesn't work - using callback style
// UserSchema.pre('save', function(next) {
//   const user = this;
//
//   // Only run if password was modified
//   if (!user.isModified('password')) return next();
//
//   bcrypt.genSalt(12, (err, salt) => {
//     if (err) return next(err);
//
//     bcrypt.hash(user.password, salt, (err, hash) => {
//       if (err) return next(err);
//       user.password = hash;
//       next();
//     });
//   });
// });

// Method to check if password is correct
UserSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
