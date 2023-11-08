const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
// 連結 User-model 的 Schema
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

// serializeUser setting
passport.serializeUser((user, done) => {
  console.log("Serialize使用者");
  done(null, user._id); // 這個是將mongoDB內的id 存入 session內部
  // 並且將id簽名後，以cookie的形式給使用者
});

passport.deserializeUser(async (_id, done) => {
  console.log(
    "Deserialize使用者。。。使用serializeUser儲存的id，去找到資料庫內的資料"
  );
  let foundUser = await User.findOne({ _id });
  done(null, foundUser); // 將 req.user 這個屬性設定為 foundUser
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("進入Google Strategy區域");
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        console.log("使用者已經註冊過了");
        done(null, foundUser);
      } else {
        console.log("偵測到新用戶，需將資料存到資料庫");
        let newUser = new User({
          name: profile.displayName,
          googleID: profile.id,
          thumbnail: profile.photos[0].value,
          email: profile.emails[0].value,
        });
        let saveUser = await newUser.save();
        console.log("成功創建新用戶。");
        done(null, saveUser);
      }
    }
  )
);

// LocalStrategy內的 username,password 是對應到 login.ejs input的name值
passport.use(
  new LocalStrategy(async (username, password, done) => {
    let foundUser = await User.findOne({ email: username });
    if (foundUser) {
      let result = await bcrypt.compare(password, foundUser.password);
      if (result) {
        done(null, foundUser); // 這個foundUser 會自動套用在 serializeUser , deserializeUser
      } else {
        done(null, false); // 第二個值 false 表示沒有被 LocalStrategy 驗證成功
      }
    } else {
      done(null, false); // 第二個值 false 表示沒有被 LocalStrategy 驗證成功
    }
  })
);
