var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var pug = require('pug');

var mysql = require('promise-mysql');
// create a connection to our Cloud9 server
var connection = mysql.createPool({
     host     : 'localhost',
     user     : 'root', 
     password : '',
     database: 'reddit',
     connectionLimit: 10
 });
var RedditAPI = require('./reddit');
var myReddit = new RedditAPI(connection);  


//example
app.get('/', function (req, res) {
  res.send('Hello World');
});

// exercise 1
// app.get('/hello', function (req, res) {
//   res.end('<h1>Hello World!</h1>');
// });

//exercise 2
app.get('/hello', function (req, res) {
  var name = req.query.name;
  if (name) {
    res.send('<h1>Hello ' + name + '! </h1>');
  }
  else{
  res.send('<h1>Hello World!</h1>');
  }
});

//note: res.send() will send the HTTP response. 
//res.end() will end the response process

//exercise 3
//test: https://reddit-nodejs-api-marissacodes.c9users.io/calculator/add?num1=2&num2=6
app.get('/calculator/:operation', function (req, res) {
  var num1 = Number(req.query.num1); //declare num1 as a number, otherwise it concatenates when adding
  var num2 = Number(req.query.num2);
  var operation = req.params.operation;
  var solution; //we'll define it later

  if(!num1) {
    num1 = 0;
  } 
  
  if(!num2) {
  num2 = 0;
  } 
  
  if(operation === "add") {
    solution = num1 + num2;
  } 
  
  if(operation === "multiply") {
    solution = num1 * num2;
  } 
  
  if(operation !== "add" && operation !== "multiply") {
    res.status(400).json({error: "Bad Request"}); //be consistent: end is sent as JSON, so send the error as JSON
    return; // this is important, so you stop running the code and don't execute everything below it . 
    } 
    
  res.send(JSON.stringify(
    {
      "operation": operation,
      "firstOperand": num1,
      "secondOperand": num2,
      "solution": solution
      }
    ));  
  }
);

//exercise 4

// app.get('/posts', (req, res) => {
//   //call getAllPosts, then start the list, then do a forEach where you 
//   //display each li, then close the ul. 

// // var myReddit = new RedditAPI(connection);  

// myReddit.getAllPosts()
// .then (posts => {
//   // res.json(posts)
//   var postList = 
//   `
//       <div id="posts">
//           <h1>List of posts</h1>
//           <ul class="posts-list">`;
          
// posts.forEach(post => {
//     postList += 
//     `<li>
//       <h2>${post.title}</h2>
      
//     </li>
//     `;
//     });
  
//       postList += 
//     ` </ul>
//     </div>
//     `;
//     res.send(postList);
    
//   })
//   .catch(err => {
//     res.status(500).send(err.stack);
//   })
// })

// ex 4 refactored with pug
app.get('/posts', (req, res) => {

myReddit.getAllPosts()
.then (posts => {
  res.render('post-list', {posts:posts})
 .catch(err => {
    res.status(500).send(err.stack);
  })
})
});

//exercise 5
// old code 
// app.get('/new-post', function (req, res) {
//   res.send(`
//   <form action="/createPost" method="POST"><!-- why does it say method="POST" ?? -->
//   <p>
//     <input type="text" name="url" placeholder="Enter a URL to content">
//   </p>
//   <p>
//     <input type="text" name="title" placeholder="Enter the title of your content">
//   </p>
//   <button type="submit">Create!</button>
// </form>`
//   );
// });

//refractored with pug
app.get('/createContent', function (req, res) {
  res.render('create-content');
});

//exercise 6
//make a variable so it's easier to pass body-parser into our app.post
var urlencodedParser = bodyParser.urlencoded({extended:false});

app.post('/createPost', urlencodedParser, function (req, res) {
//check to see if there is info in our request body, if not throw an error
  if (!req.body) return res.sendStatus(400);
  
//create an object to store our new post data  
 var newPost = {};
     newPost.url = req.body.url;
     newPost.title = req.body.title;
     newPost.userId = 1;
     newPost.subredditId = 1;
//call the function from reddit.js file   
     myReddit.createPost(newPost)
//redirect user to the /posts endpoint      
       .then(newPost.results)
          res.redirect('/posts')
       
//in case there is an error with the request       
       .catch(error => {
         console.log("Oops. Something went wrong.");
         throw error
        })
});
 
//exercise 7
app.set('view engine', 'pug');


/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  console.log('Example app listening at http://%s:', process.env.C9_HOSTNAME);
});