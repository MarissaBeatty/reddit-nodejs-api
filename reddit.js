var bcrypt = require('bcrypt-as-promised');
var HASH_ROUNDS = 10;

class RedditAPI {
    constructor(conn) {
        this.conn = conn;
    }

    createUser(user) {
        /*
        first we have to hash the password. we will learn about hashing next week.
        the goal of hashing is to store a digested version of the password from which
        it is infeasible to recover the original password, but which can still be used
        to assess with great confidence whether a provided password is the correct one or not
         */
        return bcrypt.hash(user.password, HASH_ROUNDS)
            .then(hashedPassword => {
                return this.conn.query(
                    `
                    INSERT INTO users (username, password, userCreatedAt, userUpdatedAt) 
                    VALUES (?, ?, NOW(), NOW())`,
                    [user.username, hashedPassword]
                );
            })
            .then(result => {
                return result.insertId;
            })
            .catch(error => {
                // Special error handling for duplicate entry
                if (error.code === 'ER_DUP_ENTRY') {
                    throw new Error('A user with this username already exists');
                }
                else {
                    throw error;
                }
            });
    }

    createPost(post) {
        return this.conn.query(
            `
            INSERT INTO posts (userId, title, url, subredditId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [post.userId, post.title, post.url, post.subredditId]
        )
            .then(result => {
                return result.insertId;
            })
            .catch(error => {
                throw error;
            }
            
            );
    }
   
  createSubreddit(subreddit) {
            return this.conn.query(
                `
                INSERT INTO subreddits (name, description, subId, subCreatedAt, subUpdatedAt) 
                VALUES (?, ?, ?, NOW(), NOW())`,
                [subreddit.name, subreddit.description, subreddit.subId]
            )
            .then(result => {
                return result.insertId;
            })
            .catch(error => {
                // Special error handling for duplicate entry
                if (error.code === 'ER_DUP_ENTRY') {
                    throw new Error('A subreddit with this name already exists');
                }
                else {
                    throw error;
                }
            });
    }
   
    getAllPosts() {
        /*
        strings delimited with ` are an ES2015 feature called "template strings".
        they are more powerful than what we are using them for here. one feature of
        template strings is that you can write them on multiple lines. if you try to
        skip a line in a single- or double-quoted string, you would get a syntax error.

        therefore template strings make it very easy to write SQL queries that span multiple
        lines without having to manually split the string line by line.
         */
          
        return this.conn.query(
       `SELECT posts.postId, posts.title, posts.url, posts.userId, posts.createdAt, posts.updatedAt, posts.subredditId,
       users.id, users.username, users.userCreatedAt, users.userUpdatedAt, 
       subreddits.subId, subreddits.name, subreddits.description, subreddits.subCreatedAt, subreddits.subUpdatedAt 
       FROM posts 
       JOIN users ON posts.userId = users.id 
       LEFT JOIN subreddits ON posts.subredditId = subreddits.subId 
       ORDER BY posts.createdAt DESC 
       LIMIT 25;` 
        )  
       .then(function(queryResponse) {
            return queryResponse.map(function(posts) {
            // return {
            //         "id": posts.postId,
            //         "title": posts.title,
            //         "url": posts.url,
            //         "createdAt": posts.createdAt,
            //         "updatedAt": posts.updatedAt,
            //             "user": {
            //                     "id": posts.users.id,
            //                     "username": posts.users.username,
            //                     "createdAt": posts.users.createdAt,
            //                     "updatedAt": posts.users.updatedAt
            //                     }
            //              "subreddit": {
            //                     "subredditId": posts.subId, 
            //                     "name": posts.name, 
            //                     "description": posts.description, 
            //                     "createdAt": posts.subCreatedAt, 
            //                     "updatedAt": posts.subUpdatedAt
            //             }  
            //         }
                    console.log({
                    "id": posts.postId,
                    "title": posts.title,
                    "url": posts.url,
                    "createdAt": posts.createdAt,
                    "updatedAt": posts.updatedAt,
                        "user": {
                                "id": posts.userId,
                                "username": posts.username,
                                "createdAt": posts.userCreatedAt,
                                "updatedAt": posts.userUpdatedAt
                                },
                        "subreddit": {
                                "subredditId": posts.subId, 
                                "name": posts.name, 
                                "description": posts.description, 
                                "createdAt": posts.subCreatedAt, 
                                "updatedAt": posts.subUpdatedAt
                        }        
                    });
            });
      
        });
    }
    
    getAllSubreddits() {

      return this.conn.query(
      `SELECT subId, name, description, subCreatedAt, subUpdatedAt 
      FROM subreddits
      ORDER BY subCreatedAt DESC;` 
        )  
      .then(function(queryResponse) {
            return queryResponse.map(function(subreddits) {
            // return {
                      //"id": subreddits.subId,
                    // "name": subreddits.name,
                    // "description": subreddits.description,
                    // "createdAt": subreddits.subCreatedAt,
                    // "updatedAt": subreddits.subUpdatedAt,
            //         }
                    console.log({
                    "id": subreddits.subId,
                    "name": subreddits.name,
                    "description": subreddits.description,
                    "createdAt": subreddits.subCreatedAt,
                    "updatedAt": subreddits.subUpdatedAt,
                    });
            });
      
        });
    } 
    
    createVote(vote) {
        return this.conn.query(
            `INSERT INTO votes 
            SET postId=?, userId=?, voteDirection=? 
            ON DUPLICATE KEY UPDATE voteDirection=?;`
            ) 
        .then (function(queryResponse) {
            if (vote.voteDirection > 1 || vote.voteDirection < - 1) {
                throw new Error('invalid vote');
            }
        });    
    }
} 

module.exports = RedditAPI;