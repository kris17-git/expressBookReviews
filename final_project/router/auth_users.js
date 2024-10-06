const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    //write code to check if username and password match the one we have in records.
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
      // Generate JWT access token
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 });

      // Store access token and username in session
      req.session.authorization = {
          accessToken, username
      }
      return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review;

    // Access the username from the authenticated user stored in req.user
    const username = req.session.authorization['username']

    // Ensure both username and review text are present
    if (!username || !reviewText) {
        return res.status(400).send('Username or review text missing');
    }

    // Check if the book exists in the DB
    if (!books[isbn]) {
        return res.status(404).send('Book not found');
    }

    // Access the book's reviews object
    const reviews = books[isbn].reviews;

    // Check if the user has already posted a review for this ISBN
    if (reviews[username]) {
        // Modify the existing review
        reviews[username] = reviewText;
        res.send(`Review updated successfully for ISBN: ${isbn}`);
    } else {
        // Add a new review
        reviews[username] = reviewText;
        res.send(`Review added successfully for ISBN: ${isbn}`);
    }

});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Access the username from the authenticated user
    const username = req.session.authorization['username']

    // Log user information
    console.log("User:", username);

    // Ensure both username and review text are present
    if (!username) {
        return res.status(400).send('Username is missing');
    }

    // Check if the book exists in the DB
    if (!books[isbn]) {
        return res.status(404).send('Book not found');
    }

    // Access the book's reviews object
    const reviews = books[isbn].reviews;

    let targetKey = null;

    for (let key in reviews) {
        if (key === username) {
          targetKey = key;
          break; // Stop the loop once the match is found
        }
    }

    if (targetKey) {
        delete reviews[targetKey];
        res.send(`Review of user ${username} was successfully deleted for isbn ${isbn}.`)
    } else {
        res.send(`No reviews were found for user ${username}.`)
    }

    // Log current state of the books object
    console.log("Updated books DB:", books);
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
