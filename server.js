var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = process.env.PORT || 3000;
var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/DontReadTheCommentsDB";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});

// Routes

app.get("/scrape", function(req, res) {
  axios
    .get("https://tvtropes.org/pmwiki/pmwiki.php/LetsPlay/Raocow")
    .then(function(response) {
      var mainContent = false;
      var $ = cheerio.load(response.data);
      $("li").each(function(i, element) {
        var result = {};
        
        // console.log($(this).children("a").attr("href"))
        // console.log($(this).children("a").attr("href") !== undefined)
        // console.log($(this).children("a").attr("href").slice(0,8) === "/pmwiki")

        if (
          $(this)
            .children("a")
            .text() === "Accidental Murder"
        ) {
          mainContent = true;
        }

        if (
          $(this)
            .children("a")
            .attr("href") !== undefined &&
          mainContent
        ) {
          if (
            $(this)
              .children("a")
              .attr("href")
              .slice(0, 7) === "/pmwiki"
          ) {
            console.log(
              $(this)
                .children("a")
                .text()
            );
            result.title = $(this)
              .children("a")
              .text();
            console.log(
              $(this)
                .children("a")
                .attr("href")
            );
            result.link =
              "https://tvtropes.org" +
              $(this)
                .children("a")
                .attr("href");
          }
        }
        // console.log(result);
        db.Article.create(result)
          .then(function(dbArticle) {
            // console.log(dbArticle);
          })
          .catch(function(err) {
            // console.log(err);
          });
        if (
          $(this)
            .children("a")
            .text() === "Zen Survivor"
        ) {
          mainContent = false;
        }
      });
      res.send("Scrape Complete");
    });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("comment")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(function(dbComment) {
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { comment: dbComment._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
