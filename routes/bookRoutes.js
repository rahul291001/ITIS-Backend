import express from "express";
// import {  inputBooks, login, logout, register} from "../controllers/usercontroller.js";
import {createBook, getBooks, getBookById, downloadFile, deleteBook} from "../controllers/bookcontroller.js";
// import {getBooks} from "../controllers/bookcontroller.js";
import {verifyToken} from "../middlewares/verify-token.js"
import multer from "multer";
import path from "path";

const bookRoutes = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

bookRoutes.post('/upload',verifyToken, upload.single('file'), createBook);
bookRoutes.get('/', verifyToken, getBooks);
bookRoutes.get('/:id', verifyToken, getBookById);
bookRoutes.get('/download/:id', verifyToken, downloadFile);
bookRoutes.delete('/:id', verifyToken, deleteBook);

export default bookRoutes;

