// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  // title is a required string
  title: {
    type: String,
  },
  // text is a required string
  text: {
    type: String,
  },
  saved: {
    type: Boolean
  },
  // This only saves one note's ObjectId, ref refers to the Note model
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// Create the Article model with the ArticlesSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;
