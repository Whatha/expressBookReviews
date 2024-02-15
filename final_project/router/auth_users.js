const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const authenticatedUser = (username,password)=>{
    let authenticatedUsers = users.filter((user)=>{
      return (user.username === username && user.password === password)
    });
    if(authenticatedUsers.length > 0){
      return true;
    } else {
      return false;
    }
  }

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(403).json({message: "Please fill the username and password"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("You're logged in, welcome!");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
}); 

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const userReview= req.body.review;
    const username = req.session.authorization.username;
    if( !books[isbn]){
        return res.status(404).json({message: `Book with the ISBN ${isbn} not found`});  
    }

    // This will treat the username as the key, and will update the review in case it already exists.
    books[isbn].reviews[username]= {"review": userReview}
    
  return res.status(200).json({message: `Your review to ${books[isbn].title} has been added!`});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    if( !books[isbn]){
        return res.status(404).json({message: `Book with the ISBN ${isbn} not found`});  
    }
    delete books[isbn].reviews[username]
    
  return res.status(200).json({message: `Your review to ${books[isbn].title} has been deleted!`});
});

module.exports.authenticated = regd_users;
module.exports.users = users;
