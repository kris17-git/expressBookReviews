const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    let getBooksPromise = new Promise((resolve, reject) => {
        if (books) {
            resolve(books); // Resolve immediately if books is available
        } else {
            reject("Unable to retrieve books."); // Reject if books is undefined or null
        }
    });

    getBooksPromise
        .then((bookList) => {
            res.status(200).json({ books: bookList });
        })
        .catch((error) => {
            res.status(500).json({ message: error });
        });
});



// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    // Create a Promise to handle the asynchronous operation
    let getBookByIsbnPromise = new Promise((resolve, reject) => {
        const isbn = req.params.isbn; // Extract the ISBN parameter
        const book = books[isbn]; // Lookup the book by ISBN
        
        // Check if the book exists
        if (book) {
            resolve(book); // Resolve the Promise with the book details
        } else {
            reject(`Book with ISBN ${isbn} not found.`); // Reject if not found
        }
    });

    // Handle the Promise with .then() and .catch()
    getBookByIsbnPromise
        .then((bookDetails) => {
            res.status(200).json(bookDetails); // Send the resolved book details
        })
        .catch((error) => {
            res.status(404).json({ message: error }); // Send the error message
        });
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    // Create a Promise to handle the asynchronous operation
    let getBooksByAuthorPromise = new Promise((resolve, reject) => {
        const targetValue = req.params.author; // Extract the author parameter
        const booksByAuthor = []; // Array to store matching books

        // Iterate through the books to find matches by author
        for (let key in books) {
            if (books[key]["author"] === targetValue) {
                booksByAuthor.push(books[key]); // Add matching book to the array
            }
        }

        // Resolve or reject based on whether matches are found
        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor); // Resolve with matching books
        } else {
            reject(`No books found by author: ${targetValue}`); // Reject with error message
        }
    });

    // Handle the Promise with .then() and .catch()
    getBooksByAuthorPromise
        .then((booksByAuthor) => {
            res.status(200).json(booksByAuthor); // Send matching books as response
        })
        .catch((error) => {
            res.status(404).json({ message: error }); // Send error message
        });
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    // Create a Promise to handle the asynchronous operation
    let getBookByTitlePromise = new Promise((resolve, reject) => {
        const targetValue = req.params.title; // Extract the title parameter
        let targetBook = null; // Variable to store the matching book

        // Iterate through the books to find a match by title
        for (let key in books) {
            if (books[key]["title"] === targetValue) {
                targetBook = books[key]; // Assign the matching book
                break; // Stop the loop once a match is found
            }
        }
        // Resolve or reject based on whether a match is found
        if (targetBook) {
            resolve(targetBook); // Resolve with the matching book
        } else {
            reject(`No book found with title: ${targetValue}`); // Reject with error message
        }
    });

    // Handle the Promise with .then() and .catch()
    getBookByTitlePromise
        .then((bookDetails) => {
            res.status(200).json(bookDetails); // Send the matching book as response
        })
        .catch((error) => {
            res.status(404).json({ message: error }); // Send the error message
        });
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  res.send(books[isbn]['reviews'])
});

module.exports.general = public_users;
