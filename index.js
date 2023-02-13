const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { secret } = require('./config');

const salt = bcrypt.genSaltSync(10);




app.use(cors({credentials: true, origin: 'http://localhost:3000',}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://blog:opOnrmpeOR6yX1mx@cluster0.lrzqyfm.mongodb.net/test');
mongoose.set("strictQuery", false);

const router = express.Router();

// Middleware function to authenticate the user
const authenticate = (req, res, next) => {
  // Get the user's auth token from the request header
  const token = req.headers.authorization;

  // Verify the user's auth token
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      // If the token is invalid, return an error message
      return res.status(401).json({
        success: false,
        message: "Not authorized"
      });
    } else {
      // If the token is valid, set the user's ID to the request
      req.userId = decoded._id;
      next();
    }
  });
};


app.post('/register', async (req,res) => {
  const {username,password} = req.body;
  try{
    const userDoc = await User.create({
      username,
      password:bcrypt.hashSync(password,salt),
    });
    res.json(userDoc);
  } catch(e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post('/login', async (req,res) => {
  const {username,password} = req.body;
  const userDoc = await User.findOne({username});
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id:userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {title,summary,content} = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover:newPath,
      author:info.id,
    });
    res.json(postDoc);
  });

});

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {id,title,summary,content} = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    await postDoc.update({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.json(postDoc);
  });

});

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})



// Route to handle adding a like to a post
router.patch("/post/:id/like", authenticate, (req, res) => {
  // Get the user's ID and the post's ID from the request
  const userId = req.userId;
  const postId = req.params.id;

  // Find the post in the database and update the likes count
  Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true })
    .then(post => {
      // Return the updated post
      res.json(post);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        success: false,
        message: "An error occurred"
      });
    });
});

// Route to handle removing a like from a post
router.patch("/post/:id/unlike", authenticate, (req, res) => {
  // Get the user's ID and the post's ID from the request
  const userId = req.userId;
  const postId = req.params.id;

  // Find the post in the database and update the likes count
  Post.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true })
    .then(post => {
      // Return the updated post
      res.json(post);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        success: false,
        message: "An error occurred"
      });
    });
});

// Route to handle adding a dislike to a post
router.patch("/post/:id/dislike", authenticate, (req, res) => {
  // Get the user's ID and the post's ID from the request
  const userId = req.userId;
  const postId = req.params.id;

    // Find the post in the database and update the dislikes count
    Post.findByIdAndUpdate(postId, { $addToSet: { dislikes: userId } }, { new: true })
    .then(post => {
      // Return the updated post
      res.json(post);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        success: false,
        message: "An error occurred"
      });
    });
});

// Route to handle removing a dislike from a post
router.patch("/post/:id/undislike", authenticate, (req, res) => {
  // Get the user's ID and the post's ID from the request
  const userId = req.userId;
  const postId = req.params.id;

  // Find the post in the database and update the dislikes count
  Post.findByIdAndUpdate(postId, { $pull: { dislikes: userId } }, { new: true })
    .then(post => {
      // Return the updated post
      res.json(post);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        success: false,
        message: "An error occurred"
      });
    });
});


module.exports = router;






app.listen(4000, () => {
  console.log('App is running on port 4000');
});
//