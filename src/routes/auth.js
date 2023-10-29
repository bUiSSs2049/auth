const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../model/Users");
const { generateOTP, sendOTP } = require("../util/otp");

router.post("/generate-otp", async (req, res) => {
  const email = req.body.email;
  try {
    let user = await User.findOne({ email: email });

    // If user does not exist, create a new user
    if (!user) {
      user = new User({ email: email });
    }

    // If user is blocked, return an error
    if (user.isBlocked) {
      const currentTime = new Date();
      if (currentTime < user.blockUntil) {
        return res.send({"res":"Account blocked. Try after some time."});
      } else {
        user.isBlocked = false;
        user.OTPAttempts = 0;
      }
    }

    // Check for minimum 1-minute gap between OTP requests
    const lastOTPTime = user.OTPCreatedTime;
    const currentTime = new Date();

    if (lastOTPTime && currentTime - lastOTPTime < 60000) {
      return res.send({"res":"Minimum 1-minute gap required between OTP requests"});
    }

    const OTP = generateOTP();
    user.OTP = OTP;
    user.OTPCreatedTime = currentTime;

    await user.save();

    sendOTP(email, OTP);

    //res.redirect('/login')
    return res.send({"res":"OTP sent successfully","email":email});
  } catch (err) {
    console.log(err);
    if (email == "") return res.send({"res":"Invalid Email"});
    return res.send({"res":"Server error"});
  }
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const OTP = req.body.OTP;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.send({"res":"User not found"});
    }

    // Check if user account is blocked
    if (user.isBlocked) {
      const currentTime = new Date();
      if (currentTime < user.blockUntil) {
        return res.send({"res":"Account blocked. Try after some time."});
      } else {
        user.isBlocked = false;
        user.OTPAttempts = 0;
      }
    }

    // Check OTP
    if (user.OTP !== OTP) {
      user.OTPAttempts++;

      // If OTP attempts >= 5, block user for 1 hour
      if (user.OTPAttempts >= 5) {
        user.isBlocked = true;
        let blockUntil = new Date();
        blockUntil.setHours(blockUntil.getHours() + 1);
        user.blockUntil = blockUntil;
      }

      await user.save();

      return res.send({"res":"Invalid OTP"});
    }

    // Check if OTP is within 5 minutes
    const OTPCreatedTime = user.OTPCreatedTime;
    const currentTime = new Date();

    if (currentTime - OTPCreatedTime > 5 * 60 * 1000) {
      return res.send({"res":"OTP expired"});
    }

    /*
    const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });*/

    // Clear OTP
    user.OTP = undefined;
    user.OTPCreatedTime = undefined;
    user.OTPAttempts = 0;

    await user.save();
    return res.send({"res":"success","email":email});
  } catch (err) {
    console.log(err);
    return res.send({"res":"Server error"});
  }
});
const mongoose = require("mongoose");
/*router.post("/register", async (req, res) => {
  const User = require("../model/Users");
  
  const newUser = new User({
    email: "newuser@example.com",
    OTP: "123456", // Example OTP value
    OTPCreatedTime: new Date(),
    OTPAttempts: 0,
    isBlocked: false,
  });

  newUser.save()
    .then((user) => {
      console.log("New user saved to the database:", user);
    })
    .catch((error) => {
      console.error("Error saving new user:", error);
    });

});*/

module.exports = router;
