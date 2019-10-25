https://webdevbootcamp-camiriser.c9users.io/

// Import express (Framework).
var express = require("express");
var app = express();

//Import mongoosse (Framework for mongoDB) and conect to the Data Base.
var mongoose = require("mongoose");
//This is how to connect to the localhost database before deployment
/*var options = {
    useNewUrlParser: true,
    user: "xxxxxxxxx",
    pass: "xxxxxxxxx"
};*/
//mongoose.connect("mongodb://localhost:27017/food_savior?authSource=admin", options);
var options = {
    useNewUrlParser: true
};
mongoose.connect("mongodb+srv://UserName:Password@cluster0-mr8uq.mongodb.net/test?retryWrites=true", options);

var bodyParser  = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Import packages for Authentication
var passport = require("passport");
var LocalStrategy = require("passport-local");

// Import method-override, allow us to delete things from the data base using monggosse
var methodOverride = require("method-override");

// Import request, is a package that allow to make request from node.
var request = require("request");

// Import Unirest, is a package that allow to make request from node is like request but require by the API used here.
var unirest = require('unirest');

//Import models of the DB
var User = require("./models/user");
var Profile = require("./models/profile");

//Short cut for naming the views
app.set("view engine", "ejs");

//Is fundamental to be able to use CSS.
app.use(express.static(__dirname + "/public"));


    //PASSPORT CONFIGURATION
    app.use(require("express-session")({
        secret: "two can keep a secret if one of them is dead",
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    
    //MIDDLEWARE:Will run in every ROUTE, allow acces in every ROUTE to the logged in user (req.user)
        app.use(function(req, res, next){
            res.locals.currentUser = req.user;
            next();
        });
        
    //To be able to delete things form all the routes, "_method" is the name we give it. This name is convetional.
        app.use(methodOverride("_method"));
        
    //______________________________________________________________________________________________________________________________
    //ROUTES
    //______________________________________________________________________________________________________________________________
    
    //HOME PAGE 
        app.get("/", function(req, res){
           res.render("home");
        });
    
    //SEARCH ROUTE (PRIVATE)
        app.get("/search", isLoggedIn, function(req, res){
                console.log(res.locals.currentUser);
                var userID = req.user._id;
                res.render("search", {userID: userID});
        });
        
    //PROFILE ROUTE (PRIVATE) GET REQUEST
           
        app.get("/search/:id", isLoggedIn, function(req, res){
            Profile.find({id: req.params.id}, function(err, foundProfile){
                if(err){
                    console.log(err);
                } else {
                    console.log(foundProfile);
                    res.render("prof", {profile: foundProfile});
                }
            });
        });
        //res.render("search",{currentUser: req.user});
        
    //PROFILE ROUTE (PRIVATE) POST REQUEST
      app.post("/search/:id", isLoggedIn, function(req, res){
            //var my_id = req.user._id;
            Profile.find({id: req.params.id}, function(err, profile){
                if(err){
                    console.log(err);
                } else {
                    profile[0].ingredients.push(req.body.newIngredient);
                    profile[0].save();
                    console.log(profile);
                    res.redirect("/search/" + req.params.id);
                }
            });
        });
        
    //DELETE ROUTE
        app.delete("/search/:id", isLoggedIn, function(req, res){
            Profile.find({id: req.params.id}, function(err, profile){
                if(err){
                    console.log(err);
                } else {
                    //profile[0].ingredients.pull(null);
                    profile[0].ingredients.pull(req.body.deleteIngredient);
                    profile[0].save();
                    console.log(profile);
                    res.redirect("/search/" + req.params.id);
                }
            });
        });

    //RESULTS ROUTE
        app.get("/results", isLoggedIn, function(req, res){
           
            var query = req.query.search;
            var url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients?number=5&ranking=1&ignorePantry=false&ingredients=" + query;
            //apples%2Cflour%2Csugar
            console.log(url);
                unirest.get(url)
                .header("X-RapidAPI-Key", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
                .end(function (result) {
                var data = result.body;
                console.log(result.status, result.headers, result.body);
                res.render("results", {data: data});
                });
        });
        
    // SHOW ROUTE  shows the full recipe
        app.get("/show", isLoggedIn, function(req, res){
            var query = req.query.recipeId;
            //var id = 136641; 
            var url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/" + query + "/information";
        
            unirest.get(url)
            .header("X-RapidAPI-Host", "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com")
            .header("X-RapidAPI-Key", "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
            .end(function (result) {
             var data = result.body;
             console.log(result.status, result.headers, result.body);
             res.render("show", {data: data});
            });
        });


    // ===================================================================================================
    // AUTH ROUTES
    // ===================================================================================================

    //REGISTER ROUTES
    
        // Show the register form 
        app.get("/register", function(req, res){
            res.render("register");
        });
        
        //Handdle the registration logic
        app.post("/register", function(req, res){
            
            var newUser = new User({username: req.body.username});
            User.register(newUser, req.body.password, function(err, user){
                if(err){
                    console.log(err);
                    return res.render("register");
                }
                passport.authenticate("local")(req, res, function(){
                    Profile.create({username: req.user.username, id:req.user._id}, function(err, profile){
                        if(err){
                            console.log(err);
                        } else {
                            res.redirect("/search"); 
                        }
                    });
                });
            });
        });
        
        
    //LOGIN ROUTES
    
        // Show the login form 
        app.get("/login", function(req, res){
            res.render("login");
        });
        
        //Handdle the login logic
        app.post("/login", passport.authenticate("local",{successRedirect: "/search", failureRedirect: "/login"}), function(req, res){
        });
        
    //LOGOUT ROUTE

         // Handdle the logou logic
        app.get("/logout", function(req, res){
            req.logout();
            res.redirect("/results");
        });
        
    //MIDDLEWARE (To deney access if user is not logged in, if is not logged in, it redirect to the login view
        // add the function to whatever ROUTE, need authentication to grand acces
        function isLoggedIn(req, res, next){
            if(req.isAuthenticated()){
                return next();
            }
            res.redirect("/login");
        }

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("FoodSavier App has started!!!");
});