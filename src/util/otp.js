const crypto = require("crypto");
const nodemailer = require("nodemailer");

const generateOTP = () => {
  return crypto.randomBytes(3).toString("hex");
};

const sendOTP = async(email, OTP) => {
  /*
  const transporter = nodemailer.createTransport({
    service: "hostinger",
    auth: {
      user: "help@smmfollowers1.com",
      pass: "AWnPrJkw#te84XbUFBEjq!umVDa6z",
    },
  });

  const mailOptions = {
    from: "help@smmfollowers1.com",
    to: email,
    subject: "Your OTP",
    text: `Your OTP is: ${OTP}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  */


  try {
    // Create a Nodemailer transporter using your SMTP configuration
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 587,
      secure: false, // Set to false because we're using TLS
      auth: {
        user: process.env.EMAIL_SERVICE_USER,
        pass: process.env.EMAIL_SERVICE_PASS,
      },
    });

    // Define the email content
    const mailOptions = {
      from: process.env.EMAIL_SERVICE_USER,
      to: email,
      subject: "Your OTP",
      text: `Your OTP is: ${OTP}`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }


};






module.exports = { generateOTP, sendOTP };
