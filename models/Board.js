const { Schema, model } = require("mongoose");
var express = require("express");
var cors = require("cors");
var app = express();

app.use(cors());

const BoardSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    lists: [
      {
        type: Schema.Types.ObjectId,
        ref: "lists",
      },
    ],
    activity: [
      {
        text: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    backgroundURL: {
      type: String,
    },
    members: [
      {
        _id: false,
        user: {
          type: Schema.Types.ObjectId,
          ref: "users",
        },
        name: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          default: "admin",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = Board = model("board", BoardSchema);
