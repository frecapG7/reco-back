const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  requestType: {
    type: String,
    required: true,
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
  };
};

module.exports = mongoose.model("Request", RequestSchema);
