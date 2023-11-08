const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth-routes");
require("./config/passport");
const session = require("express-session");
const passport = require("passport");
const profileRoutes = require("./routes/profile-routes");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");

//連結MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/GoogleDB")
  .then(() => {
    console.log("成功連結到MongoDB...");
  })
  .catch((e) => {
    console.log(e);
  });

//設定 middleware以及排版引擎
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Session setting
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
// Passport setting
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

//設定Routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

// 製作頁面
app.get("/", (req, res) => {
  return res.render("index", { user: req.user });
});

//連結 port
app.listen(8080, () => {
  console.log("伺服器正在聆聽port 8080....");
});
