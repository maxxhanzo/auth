const express 		= 		require("express");
const app  			= 		express();
const path 			= 		require("path");
const mongoose 		= 		require("mongoose");
const passport 		= 		require("passport");
const bodyParser 	= 		require("body-parser");
const localStrategy =	 	require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User 			=		require("./models/user");
const session 			=		require("express-session");
mongoose.connect("mongodb://localhost:27017/auth");
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret: "Bla bla bla baba bla bla",
	resave: false,
	saveUninitialized: false
}));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res)=>{
	res.sendFile(path.resolve("./views/index.html"));
})

app.get("/secret", isLoggedIn, (req, res)=>{
	res.sendFile(path.resolve("./views/secret.html"));
})


app.get("/register", (req, res)=>{
	res.sendFile(path.resolve("./views/register.html"));
})

app.post("/register", (req, res)=>{
	User.register(new User({username: req.body.username}), req.body.password, (err, user)=>{
		if(err){
			console.log(err);
			return res.sendFile(path.resolve("./views/register.html"));
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/secret");
		})
	});
})

app.get("/login", (req, res)=>{
	res.sendFile(path.resolve("./views/login.html"));
})

app.post("/login", passport.authenticate("local",{
	successRedirect: "/secret",
	failureRedirect: "/login"
}), (req, res)=>{
})

app.get("/logout", (req, res)=>{
	req.logout();
	res.redirect("/");
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.listen(3000, ()=>{
	console.log("server started");
})
