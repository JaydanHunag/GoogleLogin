//簡單寫法
const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");

router.get("/login", (req, res) => {
  return res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    // 可以讓使用者選擇其他的google信箱登入
    prompt: "select_account",
  })
);

router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  if (password.length < 6) {
    req.flash("error_msg", "密碼長度過短，至少需要6個數字或英文字。");
    return res.redirect("/auth/signup");
  }
  let foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    req.flash(
      "error_msg",
      "信箱已經被註冊。請使用另一個信箱，或者嘗試使用此信箱登入系統"
    );
    return res.redirect("/auth/signup");
  }
  let hashedPassword = await bcrypt.hash(password, 12);
  let newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  req.flash("success_msg", "恭喜註冊成功，現在可以登入系統了。");
  return res.redirect("/auth/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login", // 失敗的話redirect去哪
    failureFlash: "登入失敗，帳號或密碼不正確。", // 失敗的話flash什麼
    // failureFlash 會自動套用在 message內的error上
  }),
  (req, res) => {
    return res.redirect("/profile");
  }
);

//會在這邊加上passport.authenticate("google")是要先確定有無登入google了，如果有才會繼續執行下面的程式碼
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  console.log("進入redirect");
  return res.redirect("/profile");
});

module.exports = router;
