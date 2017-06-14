// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Requiring our Note and Articles models
var Note = require("./models/note.js");
var Article = require("./models/articles.js");

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/nytimes");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes =============================================================
// 

// A GET request to scrape the echojs website
  app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request("https://www.nytimes.com/section/health?WT.nav=page&action=click&contentCollection=Health&module=HPMiniNav&pgtype=Homepage&region=TopBar", function(error, response, html) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
      // Now, we grab every div within an article tag, and do the following:
      $("#latest-panel article div.story-meta").each(function(i, element) {

        // Save an empty result object
        var result = {};

        // Add the header title and associated text and save them as properties of the result object
        result.title = $(this).children("h2").text();
        result.text = $(this).children("p").text();

        // Using our Article model, create a new entry
        // This effectively passes the result object to the entry (and the title and text)
        var entry = new Article(result);

        // Now, save that entry to the db
        entry.save(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          // Or log the doc
          else {
            console.log(doc);
          }
        });

      });
    });
    // Tell the browser that we finished scraping the text
    res.send("Scrape Complete");
  });


  // This will get the articles we scraped from the mongoDB
app.get("/", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.render("index", {Article: doc});
    }
  });
});

  // Route displays only saved articles
app.get("/saved", function(req, res) {
  // Grab every SAVED doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.render("saved", {Article: doc});
    }
  });
});

  // This saves article by updating database "saved" to true
app.post("/:id", function(req, res) {
  // update this selected id
  Article.findOneAndUpdate(
      { "_id" : req.params.id },
      { $set: { "saved": true } }
   )
  // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.redirect("/");
        }
      });
});

  // This saves article by updating database "saved" to true
  // but only deletes from saved and NOT the database
app.post("/delete/:id", function(req, res) {
  // update this selected id
  Article.findOneAndUpdate(
      { "_id" : req.params.id },
      { $set: { "saved": false } }
   )
  // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // or redirect to /saved route
          res.redirect("/saved");
        }
      });
});

// New note creation via POST route
app.post("/submit", function(req, res) {
  // Use our Note model to make a new note from the req.body
  var newNote = new Note(req.body);
  // Save the new note to mongoose
  newNote.save(function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Otherwise
    else {
      // Find our user and push the new note id into the User's notes array
      User.findOneAndUpdate({}, { $push: { "notes": doc._id } }, { new: true }, function(err, newdoc) {
        // Send any errors to the browser
        if (err) {
          res.send(err);
        }
        // Or send the newdoc to the browser
        else {
          // or redirect to /saved route
          res.redirect("/saved");
        }
      });
    }
  });
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});