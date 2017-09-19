// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
//mongoose promise depricated use bluebird
var Promise= require("bluebird");

mongoose.Promise = Promise;

// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

//requiring the models
var Chat= require("./models/note.js");
var Articles= require("./models/articles.js");

// Initialize Express
var app = express();

var port = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Set up a static folder (public) for our web app
app.use(express.static("public"));
//the css and image
//app.use(express.static(path.join(__dirname, "/public")));

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//mongoose localhost connection
mongoose.connect("mongodb://localhost/mtvScrape");

mongoose.connect("mongodb://heroku_36qch87t:6e9t74vm4jsdcnbsj0kefeg5h9@ds141514.mlab.com:41514/heroku_36qch87t")
var db = mongoose.connection;

//show mongoose error
db.on("error", function(error){
    console.log("Mongoose error!",error);
});

//Once log into db through mongoose
db.on("open",function(){
   console.log("Mongoose connection successful"); 
});

//Basic route that sends the user first to the AJAX Page from the htmlRoutes.
//require("./routes/routes.js")(app);
// Import routes and give the server access to them.
var routes = require("./routes/routes.js");
app.use("/", routes);

// Listen on port 3000
app.listen(port, function() {
  console.log("App running on port 3000!");
});