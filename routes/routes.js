var express = require('express');
var router = express.Router();
var mongojs = require("mongojs");
var request = require("request");
var cheerio = require("cheerio");
// Require Note and Article models
var Article = require('../models/articles.js');
var Note = require('../models/note.js');

// Hook mongojs configuration to the database
Article.on("error", function (error) {
    console.log("Database Error:", error);
});

// Main route (to render the webpage with handlebars)
router.get("/", function (req, res) {
    Article.find({})
        .then(function (articles) {
            res.render("index", {
                articles: articles
            });
        })
});

// Retrieve data from the db
router.get("/all", function (req, res) {
    //  Query: In our database, go to the scrapedData collection, then "find" everything
    Article.find({}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the result of this query to the browser as json
        else {
            res.json(found);
            res.redirect('/');
        }
    });
});

// Scrape data from one site and place it into the mongodb db
router.get("/scrape", function (req, res) {

    // Make a request for the news section of combinator
    request("http://www.mtv.com/news/", function (error, response, html) {
        // Load the html body from request into cheerio
        var $ = cheerio.load(html);
        // For each element with a "tag-item" class
        $("article h1").each(function (i, element) {
            //all scraped articles will be save into this empty array.    
            var results = {};

            // get the tittle,link,summary,image of each article enclosed in the current element and add them to the results array
            results.title = $(element).children("a").text();

            results.link = $(element).children("a").attr("href");

            results.summary = $(element).attr("p", "subhead").text();

            results.image = "http://www.mtv.com/" + $(element).find("img").attr("src");


            //take the scraped data to the article model
            var scrapeInfo = new Article(results);

            //save articles that where scraped into out mongodb 
            scrapeInfo.save(function (err, doc) {
                // log any errors
                if (err) {
                    console.log(err);
                }
                // or log the doc
                else {
                    console.log(doc);    
                }
            });
        });
    });
});

//getting note for specific article
router.get("/articles/:id", function (req, res) {
    Article.findOne({
            "_id": req.params.id
        })
        .populate("note")
        // Now, execute that query
        .exec(function (error, doc) {
            // Send any errors to the browser
            if (error) {
                res.send(error);
            }
            // Or, send our results to the browser, which will now include the books stored in the library
            else {
                res.send(doc);
            }
        });
});

// Create a new note 
router.post("/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    var newNote = new Note(req.body);

    // And save the new note the db
    newNote.save(function (error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's note
            //need "{new: true}" in our call,
            // or else our query will return the object as it was before it was updated
            Article.findOneAndUpdate({
                    _id: req.params.id
                }, {
                    $push: {
                        note: doc._id
                    }
                }, {
                    new: true
                })
                // Execute the above query
                .exec(function (err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    } else {
                        // Or send the document to the browser
                        res.send(doc);
                    }
                });
        }
    });
});

//delete note by id
router.post("/delete/:id", function (req, res) {
    Note.findByIdAndRemove({
            _id: req.params.id
        },
        function (error) {
            // Throw any errors to the console
            if (error) {
                console.log(error);
            }

        });

});

// Export routes for server.js to use.
module.exports = router;
