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
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(JSON.stringify({books}, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  // Extract the isbn parameter from the request URL
  const isbn = req.params.isbn;
  res.send(books[isbn])
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  // Extract the author parameter from the request URL
  const targetValue = req.params.author;
  let targetKey = null;

  for (let key in books) {
    if (books[key]["author"] === targetValue) {
      targetKey = key;
      break; // Stop the loop once the match is found
    }
  }

  if (targetKey) {
      res.send(books[targetKey])
  } else {
      res.send("No matching entry found.")
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // Extract the title parameter from the request URL
  const targetValue = req.params.title;
  let targetKey = null;

  for (let key in books) {
  if (books[key]["title"] === targetValue) {
  targetKey = key;
  break; // Stop the loop once the match is found
  }
  }

  if (targetKey) {
  console.log("Matching entry:", books[targetKey]);
  res.send(books[targetKey])
  } else {
  console.log("No matching entry found.");
  res.send("No matching entry found.")
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  res.send(books[isbn]['reviews'])
});

module.exports.general = public_users;
