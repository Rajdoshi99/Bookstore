const multer = require("multer");
const path = require("path");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

//home page
exports.home = (req, res) => {
  if (req.session.email) {
    res.render("pages/home", { user: req.session.email });
  } else {
    res.render("pages/home", { user: null });
  }
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Uploads is the Upload_folder_name
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  },
});

const maxSize = 5 * 1000 * 1000;
exports.upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    // Set the filetypes, it is optional
    var filetypes = /jpeg|jpg|png/;
    var mimetype = filetypes.test(file.mimetype);

    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(
      "Error: File upload only supports the " +
        "following filetypes - " +
        filetypes
    );
  },
});

//post ad
exports.postad = (req, res) => {
  if (req.session.email) {
    res.render("pages/postad", { user: req.session.email });
  } else {
    res.redirect("/login");
  }
};

//display products
exports.getProducts = (req, res) => {
  var category = req.params.cat;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("bechdoDB");
    dbo
      .collection("advertisements")
      .find({ category: category })
      .toArray(function (err, result) {
        if (err) throw err;
        //console.log(result);

        if (req.session.email) {
          res.render("pages/products", {
            search: null,
            category: category,
            products: result,
            user: req.session.email,
          });
        } else {
          res.render("pages/products", {
            search: null,
            category: category,
            products: result,
            user: null,
          });
        }

        db.close();
      });
  });
};

//display user's ads
exports.displayUserAds = (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("bechdoDB");
    dbo
      .collection("advertisements")
      .find({ usermail: req.session.email })
      .toArray(function (err, result) {
        if (err) throw err;
        //console.log(result);

        if (req.session.email) {
          res.render("pages/myads", {
            advertisements: result,
            user: req.session.email,
          });
        } else {
          res.redirect("/login");
        }
        db.close();
      });
  });
};

//update ad
exports.updateAd = (req, res) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("bechdoDB");
    dbo
      .collection("advertisements")
      .findOne(
        { usermail: req.session.email, title: req.params.title },
        function (err, result) {
          if (err) throw err;
          if (req.session.email) {
            res.render("pages/updateAd", {
              advertisement: result,
              user: req.session.email,
            });
          } else {
            res.redirect("/login");
          }
          db.close();
        }
      );
  });
};

//update ad data in db
exports.adUpdate = (req, res) => {
  req.body.file = req.file.path;
  //console.log(req.query);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("bechdoDB");
    var myquery = { title: req.body.prevname };
    var newvalues = {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        seller_name: req.body.seller_name,
        seller_number: req.body.seller_number,
        seller_email: req.body.seller_email,
        city: req.body.city,
        file: req.body.file,
      },
    };
    dbo
      .collection("advertisements")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        //console.log("1 document updated");
        db.close();
      });
  });
  res.redirect("/myads");
};

//search
exports.searchProduct = (req, res) => {
  const searchfield = req.query.searchfield;
  //console.log(searchfield);

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("bechdoDB");
    var query = { title: { $regex: searchfield, $options: "$i" } };
    dbo
      .collection("advertisements")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;

        if (req.session.email) {
          res.render("pages/products", {
            search: searchfield,
            category: null,
            products: result,
            user: req.session.email,
          });
        } else {
          res.render("pages/products", {
            search: searchfield,
            category: null,
            products: result,
            user: null,
          });
        }

        db.close();
      });
  });
};

//delete ad from db
exports.deleteAd = (req, res) => {
  var title = req.params.title;
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("bechdoDB");
    var myquery = { title: title };
    dbo.collection("advertisements").deleteOne(myquery, function (err, obj) {
      if (err) throw err;
      //console.log("1 document deleted");
      db.close();
    });
  });
  res.redirect("/myads");
};

//route for product full details
exports.productDetails = (req, res) => {
  var title = req.params.title;
  //console.log(title);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("bechdoDB");
    dbo
      .collection("advertisements")
      .findOne({ title: title }, function (err, result) {
        if (err) throw err;
        //console.log(result);

        if (req.session.email) {
          res.render("pages/product", {
            product: result,
            user: req.session.email,
          });
        } else {
          res.render("pages/product", {
            product: result,
            user: null,
          });
        }

        db.close();
      });
  });
};

//ad upload
exports.uploadAd = (req, res) => {
  req.body.file = req.file.path;
  //console.log(req.body);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("bechdoDB");
    req.body.usermail = req.session.email;
    var myobj = req.body;
    //console.log(myobj);
    dbo.collection("advertisements").insertOne(myobj, function (err, res) {
      if (err) throw err;
      //onsole.log("1 document inserted");
      db.close();
    });
  });
  res.redirect("/");
};

exports.contactUser = (req, res) => {
  whatsapp = req.body.contact;
  if (req.session.email) {
    res.redirect(`https://wa.me/91${whatsapp}`);
  } else {
    res.redirect("/login");
  }
};
