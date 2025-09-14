const express = require("express");
const app = express();
const session = require("express-session");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./model/usermodel");
const jwt = require("jsonwebtoken");

//database is connected
mongoose
  .connect(
    `mongodb+srv://WEB:WEB@cluster0.jlwc67p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    console.log("connected...");
  });
//create  token
const secret = "abhishekkhan";
const createToken = (_id) => {
  return jwt.sign({ _id }, secret, { expiresIn: "4d" });
};

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

//create session
app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: false,
  })
);

let checkLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("login");
  }
};

//router
app.get('/',(req,res)=>{
res.render(__dirname + "/view/home")
})


app.get("/profile", checkLogin, (req, res) => {
  res.send(
    `<h1>Home Page</h1>  ${req.session.user}  <br> <hr> <a href="/logout">Logout</a>`
  );
});
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/profile");
  } else {
    res.render(__dirname + "/view/login", { error: null });
  }
});

app.post("/login", async (req, res) => {
  const { username, userpassword } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.render(__dirname + "/view/login", { error: "user not found" });
  }
  const isMatch = await bcrypt.compare(userpassword, user.userpassword);
  if (!isMatch) {
    return res.render(__dirname + "/view/login", { error: "user not found" });
  }
  //session created
  req.session.user = username;

  res.redirect("/profile");
});
//logout route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.get("/register", (req, res) => {
  res.render(__dirname + "/view/register");
});
app.post("/register", async (req, res) => {

  const { name, username, userpassword } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render(__dirname + "/view/register", {
        error: "User already exists with this email/username",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userpassword, 10);

    // Save user
    const newUser = await User.create({
      name,
      username,
      userpassword: hashedPassword,
    });

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


app.listen(5000, () => {
  console.log("serverr is started in..");
});
