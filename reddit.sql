-- This creates the users table. The username field is constrained to unique
-- values only, by using a UNIQUE KEY on that column
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(60) NOT NULL, -- why 60??? ask me :)
  userCreatedAt DATETIME NOT NULL,
  userUpdatedAt DATETIME NOT NULL,
  UNIQUE KEY username (username)
);

-- This creates the posts table. The userId column references the id column of
-- users. If a user is deleted, the corresponding posts' userIds will be set NULL.
CREATE TABLE posts (
  postId INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) DEFAULT NULL,
  url VARCHAR(2000) DEFAULT NULL,
  userId INT DEFAULT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  KEY userId (userId), -- why did we add this here? ask me :)
  CONSTRAINT validUser FOREIGN KEY (userId) REFERENCES users (id) ON DELETE SET NULL
); 

ALTER TABLE posts ADD (
  subredditId INT,
  KEY subredditId (subredditId),
  CONSTRAINT validSubreddit FOREIGN KEY (subredditId) REFERENCES subreddits (subId) ON DELETE SET NULL
);

CREATE TABLE subreddits (
  subId INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  description VARCHAR(200) DEFAULT NULL,
  subCreatedAt DATETIME NOT NULL,
  subUpdatedAt DATETIME NOT NULL,
  UNIQUE KEY name (name)
);

CREATE TABLE votes (
  userId INT,
  postId INT,
  voteDirection TINYINT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (userId, postId), -- this is called a composite key because it spans multiple columns. the combination userId/postId must be unique and uniquely identifies each row of this table.
  KEY userId (userId), -- this is required for the foreign key
  KEY postId (postId), -- this is required for the foreign key
  FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE, -- CASCADE means also delete the votes when a user is deleted
  FOREIGN KEY (postId) REFERENCES posts (postId) ON DELETE CASCADE -- CASCADE means also delete the votes when a post is deleted
);
