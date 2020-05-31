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


//home
app.get("/", function(req, res) {
  res.render("home");
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
  } else {
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login');
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
  res.redirect("/login");
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
  res.render("enregister_cooperative");
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

  res.render("statistiques/cooperativeAuMaroc");
});

app.get("/selectionnerAnneeRegions", function(req, res) {

  res.render("statistiques/Regions/selectionnerAnneeRegions");
});

app.get("/selectionnerAnneeRegionsFemmes", function(req, res) {

  res.render("statistiques/Regions/selectionnerAnneeRegionsFemmes");
});

app.get("/selectionnerAnneeRegionsLaureats", function(req, res) {

  res.render("statistiques/Regions/selectionnerAnneeRegionsLaureats");
});

app.get("/selectionnerAnneeSecteurs", function(req, res) {

  res.render("statistiques/Secteurs/selectionnerAnneeSecteurs");
});

app.get("/selectionnerAnneeSecteursFemmes", function(req, res) {

  res.render("statistiques/Secteurs/selectionnerAnneeSecteursFemmes");
});

app.get("/selectionnerAnneeSecteursLaureats", function(req, res) {

  res.render("statistiques/Secteurs/selectionnerAnneeSecteursLaureats");
});



app.post("/selectionnerAnneeRegions", function(req, res) {

  var annee = Number(req.body.annee);
  console.log(annee);

  if (annee === 2015) {
    res.render("statistiques/Regions/cooperativesRegions")
  } else {
    res.redirect("/selectionnerAnneeRegions")
  };
});

app.post("/selectionnerAnneeRegionsFemmes", function(req, res) {

  var annee = Number(req.body.annee);
  console.log(annee);

  if (annee === 2015) {
    res.render("statistiques/Regions/cooperativesFemmesRegions")
  } else {
    res.redirect("/selectionnerAnneeRegionsFemmes")
  };
});

app.post("/selectionnerAnneeRegionsLaureats", function(req, res) {

  var annee = Number(req.body.annee);
  console.log(annee);

  if (annee === 2015) {
    res.render("statistiques/Regions/cooperativesLaureatsRegions")
  } else {
    res.redirect("/selectionnerAnneeRegionsLaureats")
  };
});





app.post("/selectionnerAnneeSecteurs", function(req, res) {

  var annee = Number(req.body.annee);
  console.log(annee);

  if (annee === 2015) {
    res.render("statistiques/Secteurs/cooperativesSecteurs")
  } else {

    res.redirect("/selectionnerAnneeSecteurs")
  };
});

app.post("/selectionnerAnneeSecteursFemmes", function(req, res) {

  var annee = Number(req.body.annee);
  console.log(annee);

  if (annee === 2015) {
    res.render("statistiques/Secteurs/cooperativesFemmesSecteurs")
  } else {
    res.redirect("/selectionnerAnneeSecteursFemmes")
  };
});

app.post("/selectionnerAnneeSecteursLaureats", function(req, res) {

  var annee = Number(req.body.annee);
  console.log(annee);

  if (annee === 2015) {
    res.render("statistiques/Secteurs/cooperativesLaureatsSecteurs")
  } else {
    res.redirect("/selectionnerAnneeSecteursLaureats")
  };
});



//-------------------------Admin section-----------------------------------

const defaultUsers = [];

const listSchema = {

  utilisateur: [UserSchema]
};

const List = mongoose.model("List", listSchema);
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
        console.log(authentified);
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







var usersf=[];
User.find(function(err, users) {
  if (err) {
    console.log(err);
  } else {
      usersf=users
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
          usersf=users
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


app.get('/attcooperative',function(req,res) {
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

app.get('/aprvcooperative',function(req,res) {
  res.render('aprvCooperative',{data:""})
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
  Cooperative.findOne({nomCoop: nomCoopnew},function(err,cooperativeres) {
    if (err) {
      console.log(err);
    }else {
      const cooperative=new CooperativeAprv( {
        nomCoop:cooperativeres.nomCoop,
        numTPI: cooperativeres.numTPI,
        address: cooperativeres.address,
        numAdherents: cooperativeres.numAdherents,
        numFemmes: cooperativeres.numFemmes,
        telephone: cooperativeres.telephone,
        secteurActivite: cooperativeres.secteurActivite,
        branche:cooperativeres.branche,
        region: cooperativeres.region,
        province:cooperativeres.province,
        nomPresident:cooperativeres.nomPresident,
        presidentPhone:cooperativeres.presidentPhone,
      })
      cooperative.save();
      Cooperative.deleteOne({nomCoop: nomCoopnew}, function(err) {
        if (err) {
          console.log(err);
        } else {
          res.render("aprvCooperative", {data: "Cooperative Approuvée!"})
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
