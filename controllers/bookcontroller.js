import dotenv from 'dotenv';
import bookModel from "../models/booksModel.js";
// import bookModel from "../models/b";
import sanitize from 'sanitize-filename';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const secretKey = process.env.ENCRYPTING_SECRET_KEY;

export const createBook = async (req, res) => {
  const { bookTitle, yearPublication, author, publisher, description } = req.body;
  const fileLoc = sanitize(req.file.filename);
  console.log(fileLoc)
  try {
      const newBook = new bookModel({
        bookTitle,
        yearPublication,
        author,
        publisher,
        description,
        fileLoc,
      });
      await newBook.save();
      res.status(200).json({ success: true, message:"Book inserted" });
      // res.json(newBook);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

export const getBooks = async (req, res) => {
  try {
    const books = await bookModel.find({});
    res.status(200).json({ success: true, books});
  } catch (error) {
    console.log("error: ", error);
    res.status(400).json(error);
  }
};

// Get a single book by ID
export const getBookById = async (req, res) => {
  try {
      const book = await bookModel.findById(req.params.id);
      if (!book) return res.status(404).json({ message: "Book not found" });
      res.json(book);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

// Serve a file securely
export const downloadFile = async (req, res) => {
  try {
      const book = await bookModel.findById(req.params.id);
      console.log(req.params.id)
      if (!book) return res.status(404).json({ message: "Book not found" });

      // Check authorization here (e.g., user authentication, permissions, etc.)
      // For now, we'll assume the request is authorized
      console.log(__dirname)
      const filePath = path.join(__dirname, '..', 'uploads', book.fileLoc);
      console.log(filePath)
      console.log(sanitize(book.fileLoc))
      res.download(filePath, sanitize(book.fileLoc));

  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


export const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await bookModel.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check Mongoose deletion result
    const deleteResult = await bookModel.deleteOne({ _id: bookId });
    if (deleteResult.deletedCount === 0) {
      return res.status(400).json({ message: 'Failed to delete book from database' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', book.fileLoc);
    try {
      await fs.promises.unlink(filePath);
      res.status(200).json({ message: 'Book deleted successfully' });
    } catch (err) {
      console.error("Error deleting book file:", err);
      // Handle file deletion error (e.g., log and return appropriate error message)
      return res.status(500).json({ message: 'Failed to delete book file' });
    }
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
