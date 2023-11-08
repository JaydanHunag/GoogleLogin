//簡單寫法
const router = require("express").Router();
const Post = require("../models/post-model");

// 如果沒有登入的話就不會跳轉到profile頁面，會自動導向登入頁面
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.redirect("/auth/login");
  }
};

router.get("/", ensureAuthenticated, async (req, res) => {
  let postFound = await Post.find({ author: req.user._id });
  return res.render("profile", { user: req.user, posts: postFound }); // deSerializeUser()
});

router.get("/post", ensureAuthenticated, (req, res) => {
  return res.render("post", { user: req.user });
});

router.post("/post", ensureAuthenticated, async (req, res) => {
  let { title, content } = req.body;
  let newPost = await new Post({
    title,
    content,
    author: req.user._id,
  });
  try {
    let savePost = await newPost.save();
    return res.redirect("/profile");
  } catch (e) {
    req.flash("error_msg", "標題與內容都要填寫");
    return res.redirect("/profile/post");
  }
});
module.exports = router;
