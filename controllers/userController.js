const crypto = require("crypto");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

//login
exports.loginUser = (req, res) => {
  res.render("pages/login", {
    msg: "",
  });
};

//register
exports.registerUser = (req, res) => {
  res.render("pages/register", {
    msg: "",
  });
};

//adding new user
exports.addUser = (req, res) => {
  //console.log(req.query);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("bechdoDB");
    dbo
      .collection("users")
      .findOne({ email: req.body.email }, function (err, result) {
        if (err) throw err;
        if (result != null) {
          //console.log(result);
          res.render("pages/register", {
            msg: "Username already exist...",
          });
        } else {
          //console.log(result);
          var password_hash = crypto
            .createHash("md5")
            .update(req.body.passwd)
            .digest("hex");
          var myobj = { email: req.body.email, password: password_hash };
          dbo.collection("users").insertOne(myobj, function (err, res) {
            if (err) throw err;
            //console.log("1 document inserted");
            db.close();
          });
          res.redirect("/login");
        }
        db.close();
      });
  });
  
};

//check user in db
exports.checkLogin = (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("bechdoDB");
    var password_hash = crypto
      .createHash("md5")
      .update(req.query.passwd)
      .digest("hex");
    dbo
      .collection("users")
      .findOne(
        { email: req.query.email, password: password_hash },
        function (err, result) {
          if (err) throw err;
          if (result == null) {
            //console.log(result);
            res.render("pages/login", {
              msg: "Invalid email or password...",
            });
          } else {
            //console.log(result);
            req.session.email = result.email;
            res.redirect("/");
          }
          db.close();
        }
      );
  });
};

//logout
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw err;
    } else {
      res.redirect("/");
    }
  });
};
