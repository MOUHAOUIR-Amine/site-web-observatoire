//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const passportLocal = require("passport-local");
const md5 = require('md5');


const app = express();
app.use(express.static("public"));




// EJS
// app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({
  extended: true
}));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


// Connect flash
app.use(flash());


// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


// DB Config
mongoose.connect("mongodb+srv://admin-ODCO:admin-ODCO@cluster0-hyh3g.mongodb.net/ODCODB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);


// Load User model
const UserSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  domaineActivite: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);



// Load Admin model
const AdminSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  job: {
    type: String,
    required: false
  },
  articles: {
    type: Number,
    required: false
  },
  followers: {
    type: Number,
    required: false
  },
  following: {
    type: Number,
    required: false
  }
});

const Admin = mongoose.model('Admin', AdminSchema);
// Passport Config
const mdp = md5("iliasilias");
const admin = new Admin({
  nom: "sanatii",
  prenom: "iliias",
  username: "ilias12@gmail.com",
  password: mdp,
  job: "Web Designer & Developer",
  articles: 1050,
  followers: 23470,
  following: 6036
});
// admin.save()









// Passport Config

const LocalStrategy = require('passport-local').Strategy;

passport.use(
  new LocalStrategy({
    usernameField: 'email'
  }, (email, password, done) => {
    // Match user
    User.findOne({
      email: email
    }).then(user => {
      if (!user) {
        return done(null, false, {
          message: 'That email is not registered'
        });
      }

      // Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: 'Password incorrect'
          });
        }
      });
    });
  })
);


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//----------------------------------- Routes------------------------------------

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

var auth=0;
//home
app.get("/", function(req, res) {
  res.render("home",{auth:auth});
});

//register
app.get("/register", function(req, res) {
  res.render("register");
});

//login
app.get("/login", function(req, res) {
  res.render("login");
});


//login-home
app.get("/login_home", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("login_home");
    auth=1;
  } else {

    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login');
    auth=0;
  };
});


// Register
app.post("/register", function(req, res) {

  const {
    nom,
    prenom,
    email,
    password,
    password2,
    domaineActivite,
    phoneNumber
  } = req.body;

  let errors = [];

  if (!nom || !prenom || !email || !password || !password2 || !domaineActivite || !phoneNumber) {
    errors.push({
      msg: 'Please enter all fields'
    });
  }

  if (password != password2) {
    errors.push({
      msg: 'Passwords do not match'
    });
  }

  if (password.length < 6) {
    errors.push({
      msg: 'Password must be at least 6 characters'
    });
  }

  if (phoneNumber.length < 6) {
    errors.push({
      msg: 'please enter a valid number'
    });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      nom,
      prenom,
      email,
      password,
      password2,
      domaineActivite,
      phoneNumber,
    });
  } else {

    User.findOne({
      email: email
    }).then(function(user) {
      if (user) {
        errors.push({
          msg: 'Email already exists'
        });
        res.render('register', {
          errors,
          nom,
          prenom,
          email,
          password,
          password2,
          domaineActivite,
          phoneNumber,
        });
      } else {
        const newUser = new User({
          nom,
          prenom,
          email,
          password,
          domaineActivite,
          phoneNumber,
        });

        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(newUser.password, salt, function(err, hash) {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(function(user) {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect("/login");
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
app.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/login_home',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

//Logout
app.get('/logout', function(req, res) {
  req.logout();

  req.flash('success_msg', 'You are logged out');
  res.redirect("/");
  auth=0;
});


//-------------------------Cooperative Schema-----------------------------------

const CoopSchema = new mongoose.Schema({
  nomCoop: {
    type: String,
    required: true
  },
  numTPI: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  numAdherents: {
    type: Number,
    required: true
  },
  numFemmes: {
    type: Number,
    required: true
  },
  telephone: {
    type: Number,
    required: true
  },
  secteurActivite: {
    type: String,
    required: true
  },
  branche: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  nomPresident: {
    type: String,
    required: true
  },
  presidentPhone: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Cooperative = mongoose.model("Cooperative", CoopSchema);


const CoopAprvSchema = new mongoose.Schema({
  nomCoop: {
    type: String,
    required: true
  },
  numTPI: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  numAdherents: {
    type: Number,
    required: true
  },
  numFemmes: {
    type: Number,
    required: true
  },
  telephone: {
    type: Number,
    required: true
  },
  secteurActivite: {
    type: String,
    required: true
  },
  branche: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  nomPresident: {
    type: String,
    required: true
  },
  presidentPhone: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const CooperativeAprv = mongoose.model("CooperativeAprv", CoopAprvSchema);







//enregister_cooperative
app.get("/enregister_cooperative", function(req, res) {
  res.render("enregister_cooperative",{auth:auth});
});



app.post("/enregister_cooperative", function(req, res) {

  const {
    nomCoop,
    numTPI,
    address,
    numAdherents,
    numFemmes,
    telephone,
    secteurActivite,
    branche,
    region,
    province,
    nomPresident,
    presidentPhone
  } = req.body;

  let errors = [];

  if (!nomCoop || !numTPI || !address || !numAdherents || !numFemmes || !telephone || !secteurActivite || !branche || !region || !province || !nomPresident || !presidentPhone) {
    errors.push({
      msg: 'Please enter all fields'
    });
  }

  // if (password != password2) {
  //   errors.push({ msg: 'Passwords do not match' });
  // }
  //
  // if (password.length < 6) {
  //   errors.push({ msg: 'Password must be at least 6 characters' });
  // }

  // if (presidentPhone.length < 6) {
  //   errors.push({
  //     msg: 'please enter a valid number'
  //   });
  // }

  if (errors.length > 0) {
    res.render("enregister_cooperative", {
      nomCoop,
      numTPI,
      address,
      numAdherents,
      numFemmes,
      telephone,
      secteurActivite,
      branche,
      region,
      province,
      nomPresident,
      presidentPhone,
    });
  } else {

    Cooperative.findOne({
      numTPI: numTPI
    }).then(function(cooperative) {
      if (cooperative) {
        errors.push({
          msg: 'Coop already exists'
        });
        res.render("enregister_cooperative", {
          nomCoop,
          numTPI,
          address,
          numAdherents,
          numFemmes,
          telephone,
          secteurActivite,
          branche,
          region,
          province,
          nomPresident,
          presidentPhone,
        });
      } else {
        const newCooperative = new Cooperative({
          nomCoop,
          numTPI,
          address,
          numAdherents,
          numFemmes,
          telephone,
          secteurActivite,
          branche,
          region,
          province,
          nomPresident,
          presidentPhone,
        });

        newCooperative.save()
          .then(function(cooperative) {
            req.flash(
              'success_msg',
              'You are now registered and can log in'
            );
            res.redirect("/login_home");
          })
          .catch(err => console.log(err));
      }
    });
  }
});

//-------------------------Statistiques-----------------------------------
app.get("/cooperativeAuMaroc", function(req, res) {

  res.render("statistiques/cooperativeAuMaroc",{auth:auth});
});

app.get("/selectionnerRegion", function(req, res) {

  res.render("statistiques/Regions/selectionnerRegion",{auth:auth});
});


//-------------------------Statistiques par regions-----------------------------------
app.post("/selectionnerRegion", function(req, res) {
  region = req.body.region;

  switch (region) {

    case "Draâ Tafilalet":
      res.redirect("/Draa-Tafilalet")
      break;

    case "Béni Mellal Khénifra":
      res.redirect("/Beni-Mellal-Khenifra")
      break;

    case "Fès Meknès":
      res.redirect("/Fes-Meknes")
      break;

    case "Guelmim Oued Noun":
      res.redirect("/Guelmim-oued-noun")
      break;

    case "Laâyoune Sakia El Hamra":
      res.redirect("/Laayoune-Assakia-Al-hamra")
      break;

    case "Souss Massa":
      res.redirect("/Souss-Massa")
      break;

    case "Oriental":
      res.redirect("/Oriental")
      break;

    case "Marrakech Safi":
      res.redirect("/Marrakech-Safi")
      break;

    case "Dakhla Oued Ed Dahab":
      res.redirect("/Eddakhla-Oued-Eddahab")
      break;

    case "Tanger Tétouan Al Hoceïma":
      res.redirect("/Tanger-Tetouan-Al-hoceima")
      break;

    case "Rabat Salé Kénitra":
      res.redirect("/Rabat-Sale-Kenitra")
      break;

    case "Casablanca Settat":
      res.redirect("/Casablanca-Settat")
      break;
    default:
  }

});
//-------------------------Statistiques pour draa-Tafilalet-----------------------------------
app.get("/Draa-Tafilalet", function(req, res) {
  var activiteRegion = [];
  var nombreAdherent = [];

  CooperativeAprv.find({
    province: "Errachidia"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Ouarzazate"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "Midelt"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[2] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[2] = a;
      });
    };
  });

  CooperativeAprv.find({
    province: "Tinghir"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[3] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[3] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Zagora"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[4] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[4] = a
      });
      res.render("statistiques/Regions/Draa-Tafilalet", {
        activiteRegion: activiteRegion,
        nombreAdherent: nombreAdherent
      });
    };
  });

});
//---------------------------------

//-------------------------Statistiques Béni Mellal, Khénifra-----------------------------------
app.get("/Beni-Mellal-Khenifra", function(req, res) {
  var activiteRegion = [];
  var nombreAdherent = [];

  CooperativeAprv.find({
    province: "Beni-Mellal"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Azilal"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "Fquih-Ben-Salah"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[2] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[2] = a;
      });
    };
  });

  CooperativeAprv.find({
    province: "Khenifra"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[3] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[3] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Khouribga"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[4] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[4] = a
      });
      res.render("statistiques/Regions/Beni-Mellal-Khenifra", {
        activiteRegion: activiteRegion,
        nombreAdherent: nombreAdherent
      });
    };
  });

});
//--------------------------------------------FIN/Béni Mellal, Khénifra-----------------------------


//-------------------------Statistiques Rabat-Sale-Kenitra-----------------------------------
app.get("/Rabat-Sale-Kenitra", function(req, res) {
  var activiteRegion = [];
  var nombreAdherent = [];

  CooperativeAprv.find({
    province: "Rabat"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Azilal"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "Sale"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[2] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[2] = a;
      });
    };
  });

  CooperativeAprv.find({
    province: "Skhirate-Temara"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[3] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[3] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Kenitra"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[4] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[4] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Khemisset"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[5] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[5] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Sidi-Kacem"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[6] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[6] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Sidi-Slimane"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[4] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[4] = a
      });

      res.render("statistiques/Regions/Rabat-Sale-Kenitra", {
        activiteRegion: activiteRegion,
        nombreAdherent: nombreAdherent
      });
    };
  });

});
//--------------------------------------------FIN/Rabat-Sale-Kenitra-----------------------------


// //-------------------------Statistiques Casablanca-Settat-----------------------------------
app.get("/Casablanca-Settat", function(req, res) {
  var activiteRegion = [];
  var nombreAdherent = [];

  CooperativeAprv.find({
    province: "Casablanca"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Mohammédia"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "El-Jadida"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[2] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[2] = a;
      });
    };
  });

  CooperativeAprv.find({
    province: "Nouaceur"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[3] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[3] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Mediouna"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[4] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[4] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Benslimane"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[5] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[5] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Berrechid"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[6] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[6] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Settat"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[7] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[7] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Sidi-Bennour"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[8] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[8] = a
      });
      res.render("statistiques/Regions/Casablanca-Settat", {
        activiteRegion: activiteRegion,
        nombreAdherent: nombreAdherent
      });
    };
  });

});
//--------------------------------------------FIN/Casablanca-Settat-----------------------------


//-------------------------Statistiques Fes-Meknes-----------------------------------
app.get("/Fes-Meknes", function(req, res) {
  var activiteRegion = [];
  var nombreAdherent = [];

  CooperativeAprv.find({
    province: "Fes"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Meknes"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "El-Hajeb"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[2] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[2] = a;
      });
    };
  });

  CooperativeAprv.find({
    province: "Ifrane"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[3] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[3] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Moulay-Yaacoub"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[4] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[4] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Boulemane"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[5] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[5] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Sefrou"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[6] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[6] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Taza"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[7] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[7] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Taounate"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[8] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[8] = a
      });

      res.render("statistiques/Regions/Fes-Meknes", {
        activiteRegion: activiteRegion,
        nombreAdherent: nombreAdherent
      });
    };
  });

});
//--------------------------------------------FIN/Fes-Meknes-----------------------------


//-------------------------Statistiques Marrakech-Safi-----------------------------------
app.get("/Marrakech-Safi", function(req, res) {
  var activiteRegion = [];
  var nombreAdherent = [];

  CooperativeAprv.find({
    province: "Marrakech"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Chichaoua"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "Al-Haouz"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[2] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[2] = a;
      });
    };
  });

  CooperativeAprv.find({
    province: "El-Kelaâ-des-Sraghna"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[3] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[3] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Essaouira"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[4] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[4] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Rehamna"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[5] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[5] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Safi"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[6] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[6] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "Youssoufia"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[7] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[7] = a;
      });

      res.render("statistiques/Regions/Marrakech-Safi", {
        activiteRegion: activiteRegion,
        nombreAdherent: nombreAdherent
      });
    };
  });

});
//--------------------------------------------FIN/Marrakech-Safi-----------------------------




//-------------------------Statistiques Tanger-Tétouan-Al-Hoceima-----------------------------------
app.get("/Tanger-Tetouan-Al-Hoceima", function(req, res) {
  var activiteRegion = [];
  var nombreAdherent = [];

  CooperativeAprv.find({
    province: "Tanger-Assilah"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Mdiq-Fnideq"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "Tetouan"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[2] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[2] = a;
      });
    };
  });

  CooperativeAprv.find({
    province: "Fahs-Anjra"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[3] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[3] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Larache"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[4] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[4] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Al-Hoceima"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[5] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[5] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Chefchaouen"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[6] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[6] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "Ouezzane"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[7] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[7] = a;
      });

      res.render("statistiques/Regions/Tanger-Tetouan-Al-Hoceima", {
        activiteRegion: activiteRegion,
        nombreAdherent: nombreAdherent
      });
    };
  });

});



//--------------------------------------------FIN/Tanger-Tétouan-Al-Hoceima-----------------------------


//-------------------------Statistiques Oriental-----------------------------------
app.get("/Oriental", function(req, res) {
  var activiteRegion = [];
  var nombreAdherent = [];

  CooperativeAprv.find({
    province: "Oujda-Angad"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Nador"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "Driouch"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[2] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[2] = a;
      });
    };
  });

  CooperativeAprv.find({
    province: "Jerada"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[3] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[3] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Berkane"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[4] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[4] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Taourirt"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[5] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[5] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Guercif"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[6] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[6] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "Figuig"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[7] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[7] = a;
      });

      res.render("statistiques/Regions/Oriental", {
        activiteRegion: activiteRegion,
        nombreAdherent: nombreAdherent
      });
    };
  });

});



//--------------------------------------------FIN/Oriental-----------------------------

//-------------------------Statistiques Souss-Massa-----------------------------------
app.get("/Souss-Massa", function(req, res) {
  var activiteRegion = [];
  var nombreAdherent = [];

  CooperativeAprv.find({
    province: "Agadir-Ida-Outanane"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Inezgane-Ait-Melloul"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "Chtouka-Ait-Baha"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[2] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[2] = a;
      });
    };
  });

  CooperativeAprv.find({
    province: "Taroudant"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[3] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[3] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Tiznit"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[4] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[4] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Tata"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[5] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[5] = a
      });
      res.render("statistiques/Regions/Souss-Massa", {
        activiteRegion: activiteRegion,
        nombreAdherent: nombreAdherent
      });
    };
  });

});
// --------------------------------------------FIN/Béni Souss-Massa-----------------------------


//-------------------------Statistiques Guelmim-Oued-Noun-----------------------------------
app.get("/Guelmim-Oued-Noun", function(req, res) {
  var activiteRegion = [];
  var nombreAdherent = [];

  CooperativeAprv.find({
    province: "Guelmim"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Assa-Zag"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "Tan-Tan"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[2] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[2] = a;
      });

    };
  });

  CooperativeAprv.find({
    province: "Sidi-Ifni"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[3] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[3] = a
      });

      res.render("statistiques/Regions/Guelmim-Oued-Noun", {
        activiteRegion: activiteRegion,
        nombreAdherent: nombreAdherent
      });
    };
  });

});
//--------------------------------------------FIN/Guelmim-Oued-Noun-----------------------------


//-------------------------Statistiques Laayoune-Sakia-El-Hamra-----------------------------------
app.get("/Laayoune-Assakia-Al-Hamra", function(req, res) {
  var activiteRegion = [];
  var nombreAdherent = [];

  CooperativeAprv.find({
    province: "Laayoune"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });

  CooperativeAprv.find({
    province: "Boujdour"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a;
      });
    };
  });


  CooperativeAprv.find({
    province: "Tarfaya"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[2] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[2] = a;
      });
    };
  });

  CooperativeAprv.find({
    province: "Es-Semara"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[3] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[3] = a
      });
      res.render("statistiques/Regions/Laayoune-Assakia-Al-Hamra", {
        activiteRegion: activiteRegion,
        nombreAdherent: nombreAdherent
      });
    };
  });

});
//--------------------------------------------FIN/Laayoune-Sakia-El-Hamra-----------------------------


//-------------------------Statistiques Dakhla-Oued-Ed-Dahab-----------------------------------
app.get("/Eddakhla-Oued-Eddahab", function(req, res) {
  var activiteRegion = [];
  var nombreAdherent = [];


  CooperativeAprv.find({
    province: "Oued-Ed-Dahab"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteRegion[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });
  CooperativeAprv.find({
    province: "Aousserd"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteRegion[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a
      });
      res.render("statistiques/Regions/Eddakhla-Oued-Eddahab", {
        activiteRegion: activiteRegion,
        nombreAdherent: nombreAdherent
      });
    };
  });

});
//--------------------------------------------FIN/Béni Dakhla-Oued-Ed-Dahab-----------------------------

//-------------------------------------------------------------------------------------------------------------

//-------------------------------STATISTIQUES PAR SECTEURS------------------------------------------------------
app.get("/cooperativesSecteurs", function(req, res) {

  var activiteSecteur = [];
  var nombreAdherent = [];

  CooperativeAprv.find({
    secteurActivite: "Agriculture"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteSecteur[0] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[0] = a
      });
    };
  });

  CooperativeAprv.find({
    secteurActivite: "Artisanat"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteSecteur[1] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[1] = a;
      });
    };
  });


  CooperativeAprv.find({
    secteurActivite: "Tourisme"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteSecteur[2] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[2] = a;
      });
    };
  });

  CooperativeAprv.find({
    secteurActivite: "Argan"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteSecteur[3] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[3] = a
      });
    };
  });
  CooperativeAprv.find({
    secteurActivite: "Art et culture"
  }, function(err, cooperatives) {

    var a = 0;

    if (err) {
      console.log(err);
    } else {
      activiteSecteur[4] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[4] = a
      });
    };
  });

  CooperativeAprv.find({
    secteurActivite: "Mines"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteSecteur[5] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[5] = a
      });
    };
  });
  CooperativeAprv.find({
    secteurActivite: "Habitat"
  }, function(err, cooperatives) {

    var a = 0;
    if (err) {
      console.log(err);
    } else {
      activiteSecteur[6] = cooperatives.length;

      cooperatives.forEach((cooperative) => {

        a = a + cooperative.numAdherents;
        nombreAdherent[6] = a
      });
      res.render("statistiques/Secteurs/cooperativesSecteurs", {
        activiteSecteur: activiteSecteur,
        nombreAdherent: nombreAdherent,
        auth:auth
      });
    };

  });

});
//-------------------------------------------------------------------------------------































//-------------------------Admin section-----------------------------------

var authentified = 0;


var nbreusers = 0;
var nbrecooperatives = 0;
var nbreadmins = 0;








CooperativeAprv.find(function(err, cooperatives) {
  if (err) {
    console.log(err);
  } else {
    nbrecooperatives = cooperatives.length;
  }
})

User.find(function(err, users) {
  if (err) {
    console.log(err);
  } else {
    nbreusers = users.length;
  }
})

Admin.find(function(err, admins) {
  if (err) {
    console.log(err);
  } else {
    nbreadmins = admins.length;
  }
})

var nomad = ""
var prenomad = ""
var jobad = ""
var articlesad = 0
var followersad = 0
var followingad = 0








app.post('/loginAd', function(req, res) {
  const usernamead = req.body.username;
  const passwordad = md5(req.body.password);
  Admin.findOne({
    username: usernamead
  }, function(err, admin) {
    const passwordd = admin.password
    nomad = admin.nom;
    prenomad = admin.prenom;
    jobad = admin.job;
    articlesad = admin.articles;
    followersad = admin.followers;
    followingad = admin.following
    if (err) {
      console.log(err);
    } else {
      if (passwordd == passwordad) {
        res.redirect('/indexadmin');
        authentified = 1;
        // console.log(authentified);
      } else {
        res.redirect('/loginAd')
      }
    }
  })

});

app.get('/loginAd', function(req, res) {
  res.render("loginAd");
})





app.get('/tablecooperative', function(req, res) {
  CooperativeAprv.find(function(err, cooperatives) {
    if (err) {
      console.log(err);
    } else {
      if (authentified == 0) {
        res.redirect("/loginAd")
      } else {
        res.render('table-cooperative', {
          cooperatives: cooperatives
        })
      }


    }
  })
})

app.get('/createadmin', function(req, res) {
  if (authentified == 0) {
    res.redirect("/loginAd")
  } else {
    res.render('createadmin', {
      data: ""
    })
  }
})







var usersf = [];
User.find(function(err, users) {
  if (err) {
    console.log(err);
  } else {
    usersf = users
  }
})


app.get('/indexadmin', function(req, res) {
  if (authentified == 0) {
    res.redirect("/loginAd")
  } else {
    User.find(function(err, users) {
      if (err) {
        console.log(err);
      } else {
        usersf = users
      }
    })
    res.render('indexadmin', {
      nom: nomad,
      prenom: prenomad,
      job: jobad,
      atrticles: articlesad,
      followers: followersad,
      following: followingad,
      nbreusers: nbreusers,
      nbrecooperatives: nbrecooperatives,
      nbreadmins: nbreadmins,
      users: usersf
    })

  }

})


app.get('/attcooperative', function(req, res) {
  Cooperative.find(function(err, cooperatives) {
    if (err) {
      console.log(err);
    } else {
      if (authentified == 0) {
        res.redirect("/loginAd")
      } else {
        res.render('cooperativeenattente', {
          cooperatives: cooperatives
        })
      }
    }
  })
})

app.get('/aprvcooperative', function(req, res) {
  res.render('aprvCooperative', {
    data: ""
  })
})

app.post('/createadmin', function(req, res) {
  const nomad = req.body.nom
  const prenomad = req.body.prenom
  const usernamead = req.body.username
  const passwordad = req.body.password
  const jobad = req.body.job
  const articlesad = req.body.articles
  const followersad = req.body.followers
  const followingad = req.body.following
  const admin = new Admin({
    nom: nomad,
    prenom: prenomad,
    username: usernamead,
    password: passwordad,
    job: jobad,
    articles: articlesad,
    followers: followers,
    following: following
  })
  admin.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("createadmin", {
        data: "admin created!"
      });
    }
  })
})





app.post("/upduser", function(req, res) {
  const nomnew = req.body.nom;
  const prenomnew = req.body.prenom;
  const emailnew = req.body.email;
  const passwordnew = req.body.password;
  const domaineActivitenew = req.body.domaineActivite;
  const phoneNumbernew = req.body.phoneNumber;
  const date = Date.now
  User.updateOne({
    email: emailnew
  }, {
    nom: nomnew,
    prenom: prenomnew,
    email: emailnew,
    password: passwordnew,
    domaineActivite: domaineActivitenew,
    phoneNumber: phoneNumbernew
  }, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/indexadmin')
    }
  })
})

app.post("/updCooperative", function(req, res) {
  var nomCoopnew = req.body.nomCoop;
  CooperativeAprv.updateOne({
    nomCoop: nomCoopnew
  }, {
    numTPI: req.body.numTPI,
    address: req.body.address,
    numAdherents: req.body.numAdherents,
    numFemmes: req.body.numFemmes,
    telephone: req.body.telephone,
    secteurActivite: req.body.secteurActivite,
    branche: req.body.branche,
    region: req.body.region,
    province: req.body.province,
    nomPresident: req.body.nomPresident,
    presidentPhone: req.body.presidentPhone,

  }, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("updCooperative", {
        data: "cooperative updated!"
      })
    }
  })
})



app.post("/userdel", function(req, res) {
  const emailnew = req.body.email;
  User.deleteOne({
    email: emailnew
  }, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/indexadmin')
    }
  })
})



app.post("/cooperativeaprv", function(req, res) {
  const nomCoopnew = req.body.nomCoop;
  Cooperative.findOne({
    nomCoop: nomCoopnew
  }, function(err, cooperativeres) {
    if (err) {
      console.log(err);
    } else {
      const cooperative = new CooperativeAprv({
        nomCoop: cooperativeres.nomCoop,
        numTPI: cooperativeres.numTPI,
        address: cooperativeres.address,
        numAdherents: cooperativeres.numAdherents,
        numFemmes: cooperativeres.numFemmes,
        telephone: cooperativeres.telephone,
        secteurActivite: cooperativeres.secteurActivite,
        branche: cooperativeres.branche,
        region: cooperativeres.region,
        province: cooperativeres.province,
        nomPresident: cooperativeres.nomPresident,
        presidentPhone: cooperativeres.presidentPhone,
      })
      cooperative.save();
      Cooperative.deleteOne({
        nomCoop: nomCoopnew
      }, function(err) {
        if (err) {
          console.log(err);
        } else {
          res.render("aprvCooperative", {
            data: "Cooperative Approuvée!"
          })
        }
      })
    }
  })
})





app.post("/cooperativedel", function(req, res) {
  const nomCoopnew = req.body.nomCoop;
  CooperativeAprv.deleteOne({
    nomCoop: nomCoopnew
  }, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("delcooperative", {
        data: "Cooperative deleted!"
      })
    }
  })
})

app.post("/cooperativerft", function(req, res) {
  const nomCoopnew = req.body.nomCoop;
  Cooperative.deleteOne({
    nomCoop: nomCoopnew
  }, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("rftcooperative", {
        data: "Cooperative refutée!"
      })
    }
  })
})



app.get("/updcooperative", function(req, res) {
  if (authentified == 0) {
    res.redirect("/loginAd")
  } else {
    res.render("updCooperative", {
      data: ""
    })
  }
})
app.get("/delcooperative", function(req, res) {
  if (authentified == 0) {
    res.redirect("/loginAd")
  } else {
    res.render("delcooperative", {
      data: ""
    })
  }
})

app.get("/rftcooperative", function(req, res) {
  if (authentified == 0) {
    res.redirect("/loginAd")
  } else {
    res.render("rftcooperative", {
      data: ""
    })
  }
})


app.get('/logoutad', function(req, res) {
  authentified = 0;
  res.redirect('/')
})









//-------------------------port listening-----------------------------------
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});

//--------------------------------odco---------------------------------

//presentation
app.get("/presentation_odco", function(req, res) {
  res.render("odcoo/presentation_odco",{auth:auth});
});
//action
app.get("/action_odco", function(req, res) {
  res.render("odcoo/action_odco",{auth:auth});
});
//mission
app.get("/mission_odco", function(req, res) {
  res.render("odcoo/mission_odco",{auth:auth});
});
//partenaire
app.get("/partenaire_odco", function(req, res) {
  res.render("odcoo/partenaire_odco",{auth:auth});
});

//-----------------------------observatoire------------------------

//presentation
app.get("/presentation_observatoire", function(req, res) {
  res.render("observatoire/presentation_observatoire",{auth:auth});
});

//etude
app.get("/etude_observatoire", function(req, res) {
  res.render("observatoire/etude_observatoire",{auth:auth});
});

//historique
app.get("/historique_observatoire", function(req, res) {
  res.render("observatoire/historique_observatoire",{auth:auth});
});

//mission
app.get("/mission_observatoire", function(req, res) {
  res.render("observatoire/mission_observatoire",{auth:auth});
});

//docutheque
app.get("/docutheque", function(req, res) {
  res.render("docutheque",{auth:auth});
});

//contact
app.get("/contact", function(req, res) {
  res.render("contact",{auth:auth});
});

//mon_compte
app.get("/mon_compte", function(req, res) {
  res.render("mon_compte",{auth:auth});
});

//modifier_compte
app.get("/modifier_compte", function(req, res) {
  res.render("modifier_compte",{auth:auth});
});

app.post("/modifier_compte",function(req,res) {
  User.updateOne({email:req.body.email},{
    nom:req.body.nom,
    prenom:req.body.prenom,
    email:req.body.email,
    password:req.body.password,
    domaineActivite:req.body.domaineActivite,
    phoneNumber:req.body.phoneNumber
  },function(err) {
    if (err) {
      console.log(err);
    }else {
      console.log("updated");
      res.redirect('/')
    }
  })
})

app.get("/deletecpt",function(req,res) {
  res.render("delete_compte",{auth:auth})
})
app.post("/deletecpt",function(req,res) {
  User.deleteOne({email:req.body.email,password:req.body.password},function(err) {
    if (err) {
      console.log(err);
    }else {
      auth=0
      res.redirect('/')
    }
  })
})



////////////////////////////
