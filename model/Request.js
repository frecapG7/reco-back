const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  requestType: {
    type: String,
    required: true,
    enum: ["BOOK", "SONG", "MOVIE"],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  tags: {
    type: [String],
    required: false,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  recommendationsCount: {
    type: Number,
    default: 0,
  },
});

RequestSchema.methods.toJSON = function () {
  return {
    id: this._id,
    requestType: this.requestType,
    title: this.title,
    description: this.description,
    tags: this.tags,
    created: this.created_at,
    author: {
      id: this.author._id,
      ...(this.populated("author") && {
        name: this.author.name,
        title: this.author.title,
        avatar: this.author.avatar,
      }),
    },
    recommendationsCount: this.recommendationsCount,
  };
};

module.exports = mongoose.model("Request", RequestSchema);
