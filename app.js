const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use("/products", express.static(path.join(__dirname, "public")));
app.use("/product", express.static(path.join(__dirname, "public")));

const productController = require("./controllers/productController");
const userController = require("./controllers/userController");

//for session login
app.use(
  session({
    secret: "therealsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { expires: 1000 * 60 * 60 * 5 },
  })
);

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

//middleware for detecting delete
app.use("/delete-ad/:title", function (req, res, next) {
  if (req.query._method == "DELETE") {
    req.method = "DELETE";
    req.url = req.path;
  }
  next();
});

//product routes
app.get("/", productController.home);
app.get("/postad", productController.postad);
app.get("/products/:cat", productController.getProducts);
app.get("/myads", productController.displayUserAds);
app.get("/update-ad/:title", productController.updateAd);
app.get("/search", productController.searchProduct);
app.get("/product/:title", productController.productDetails);
app.post(
  "/add-data",
  productController.upload.single("mypic"),
  productController.uploadAd
);
app.post(
  "/update-data",
  productController.upload.single("mypic"),
  productController.adUpdate
);
app.delete("/delete-ad/:title", productController.deleteAd);
app.post("/chat", productController.contactUser);

//user routes
app.get("/login", userController.loginUser);
app.get("/register", userController.registerUser);
app.post("/add-user", userController.addUser);
app.get("/login-check", userController.checkLogin);
app.get("/logout", userController.logoutUser);

// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

app.listen(4000, () => {
  console.log(`Example app listening at http://localhost:4000`);
});
