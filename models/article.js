var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: "comment"
  }
});

// This creates our model from the above schema, using mongoose's model method
var article = mongoose.model("article", ArticleSchema);

// Export the Article model
module.exports = article;
