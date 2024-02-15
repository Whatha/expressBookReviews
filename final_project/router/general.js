const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Function to check if the user already exists
const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }
//Register new user
public_users.post("/register", (req,res) => {
    const username = req.body.username
    const password = req.body.password
    if(username && password){
        if(!doesExist(username)){
            users.push({"username":username,"password":password});
            return res.status(200).json({message: "User created! you can log in now"});
        }else{
            return res.status(401).json({message: "This user already exists! try another one"});
        }
    } 
    return res.status(403).json({message: "Please! fill the Username and Password"});
});

// Get the book list available in the shop
public_users.get('/',async (req, res) => {
    try{
        //I won't be using JSON.stringify because postman displays it better when we send it as an object
        return res.send(books)
    } catch{
        res.status(500).json({ message: 'Server error' })
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async (req, res) => {
    const isbn = req.params.isbn
    try{
        const book = books[isbn]
        if(!book){
            throw new Error('No book found')
        }
      return res.send(book)
    }
    catch{
        return res.status(404).json({message: `Book with the ISBN ${isbn} not found`});
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',async (req, res) => {
    const authorName = req.params.author
    try{
        const filteredBooks = Object.values(books).filter(book => book.author === authorName)

        //If no book is found return a 404 error
        if(filteredBooks.length === 0){
            throw new Error('No book found')
        }
    return res.send(filteredBooks)
    } catch{
        return res.status(404).json({message: `Sorry! we have no books wrote by ${authorName}`});
    }
});

// Get all books based on title
public_users.get('/title/:title',async (req, res) => {
    const titleName = req.params.title
  try { 
        /*I used here an "Includes" so we can filter just by words or keys or the entire title
        this way people can get result just from inputing words i.e "pride"*/
        const filteredBooks = Object.values(books).filter(book => book.title.includes(titleName))

        //If no book is found return a 404 error
        if(filteredBooks.length === 0){
            throw new Error('No book found')
        }
    
    return res.send(filteredBooks)
  } catch{
    return res.status(404).json({message: `Sorry! we have no books named ${titleName}`});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn
    const review = books[isbn].reviews
    
    // If there's no review we return a 404 err
    if(!review){
        return res.status(404).json({message: `Review for the book with the ISBN ${isbn} not found`});
    }
  return res.send(review)
});

module.exports.general = public_users;
