import mongoose from "mongoose";

const booksSchema = mongoose.Schema(
  {
    bookTitle: {
      type: String,
      required: true,
      unique: true,
    },
    yearPublication: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    publisher: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: false,
    },
    fileLoc: {
      type: String,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("BookLib", booksSchema);