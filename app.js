var express              = require("express"),
    mongoose             = require("mongoose"),
    passport             = require("passport"),
    bodyParser           = require("body-parser"),
    LocalStrategy        = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User                 = require("./models/user");

mongoose.connect("mongodb://localhost/auth_demo_app", { useNewUrlParser: true, useUnifiedTopology: true });





var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

//initializeing the express session
app.use(require("express-session")({
    secret: "Rusty is the best dog",
    resave: false,
    saveUninitialized: false
})) ;

/**these 2 lines are needed to set up passports */
app.use(passport.initialize());
app.use(passport.session());

/** responsible for encoding/decoding data from the session
 * passport.serializeUser encodes data and put it back in sessoin
 * passport.deserializeUser takes data from session and de-code it
 * The serialize methods from the User exists because we gave the user Schema these methods
 * inthe user.js file
*/
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=========
//Routes
//=====================

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res) {
    res.render("secret");
})

//Authentication Routes

//show signup form
app.get("/register", function(req, res) {
    res.render("register");
});

//handling user sign up
app.post("/register", function(req, res) {
    

    //this method creates a new user by taking the user name, hash the password,
    // and store that in the database
    //if the operation is successful, it returns a new user that has username and the hashed password
    User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            res.render("register");
        }
        //this method will actually log the user in
        //the local argument specifies we will be using the local auth strategy
        passport.authenticate("local")(req, res, function() {
            res.redirect("/secret");
        });
    });
});

//LOGIN Routes

//render login form
app.get("/login", function(req, res) {
    res.render("login");
})

//login logic
/**the passport.authenticate is a middleware
 * middleware functions will be ran before the callback
 * you can have multiple middlewares
 * passport automatically takes inputs from the login.ejs form and compare
 * them to what's in the database
 */
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function(req, res) {

});

app.get("/logout", function(req, res) {
    //passport logout by destroyer the userdata in the Session
    req.logout();

    res.redirect("/");
});

//middleware, this will be added to the /secret route
/** we only want the user to see the route if they're logged in*/
function isLoggedIn(req, res, next) {
    //check to see if user is logged in
    //next refers to the next function call
    /**in this use case next refers to the callback
     * in the GET /secret route because this function
     * will be plugged into that route right before the callback
     */
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}



app.listen(process.env.PORT || 3000, process.env.IP, function() {
    console.log("server started");
})