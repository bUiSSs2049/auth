require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./src/routes/auth");
const cors = require('cors');
const app = express();



const allowedOrigins = ['http://localhost:19006'];
const corsOptions = {
  origin: (origin, callback) => {
      callback(null, true);
  },
};
app.use(cors(corsOptions));



app.use(express.json());
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send(`
  
  <form action="/auth/generate-otp" method="post">
    <input name="email" required>
    <button type="submit">go</button>
  </form>
  
  `);
});
app.get("/login", (req, res) => {
  res.send(`
  
  <form action="/auth/login" method="post">
    <input name="email" required>
    <input name="OTP" required>
    <button type="submit">go</button>
  </form>
  
  `);
});

mongoose
  .connect(`${process.env.DB_CONNECTION_STRING}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => console.log(err));




