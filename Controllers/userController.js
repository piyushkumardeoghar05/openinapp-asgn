const userModel = require("../Models/userModel");
const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const jwt_key = "sctkygjkh";
exports.createUser = async (req, res) => {
  try {
    let user = await userModel.create(req.body);

    console.log("User created");
    console.log(user);
    let uid = user._id;
        let jwt_sign = jwt.sign({payload:uid},jwt_key) 
        const decoded = jwt.verify(jwt_sign, jwt_key);
        console.log(decoded.payload);
    return res.json({
      successMessage: "User created",
      user: user,
      jwt_sign:jwt_sign
    });
  } catch (err) {
    if (err) console.log(err.message);
    return res.json({
      errorMessage: err.message,
    });
  }
};



// exports.isAuthenticated = async (req, res, next) => {
//   try {
//     let cookies = {};
//     if (req.headers.cookie) {
//       const cookiesArray = req.headers.cookie.split(";");

//       cookiesArray.forEach((cookie) => {
//         const [key, value] = cookie.trim().split("=");
//         cookies[key] = value;
//       });
//       console.log(cookies);
//       console.log(cookies["isLoggedin"]);
//       // res.json(cookies);
//       // console.log(req.cookies);
//       let isVerified = jwt.verify(cookies['isLoggedin'],jwt_key);
//       console.log(isVerified);
//       if (isVerified) {
//         console.log("user logged in verified");
//         next();
//       } else {
//         return res.json({
//           errorMessage: "Operation not allowed",
//         });
//       }
//     }
//     // console.log("Is Logged In");
//     else {
//       // console.log("Operation not allowed");
//       return res.json({
//         errorMessage: "Operation not allowed",
//       });
//     }
//   } catch (err) {
//     if (err) console.log(err.message);
//     return res.json({
//       errorMessage: err.message,
//     });
//   }
// };

exports.authenticateUser = async (req, res, next) => {
  // const token = req.body.token; // Assuming the token is provided in the request body
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authorization token is missing' });
  }
  
  try {
    const decoded = jwt.verify(token, jwt_key);
    
    // Check if a user with the decoded ID exists
    const user = await userModel.findById(decoded.payload);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authorization token' });
  }
};

// const authenticateUser = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization').replace('Bearer ', '');
//     if (!token) {
//       return res.status(401).json({ error: 'Authorization token is missing' });
//     }

//     // Decode the JWT token
//     const decoded = jwt.verify(token, 'your_secret_key');
//     const userId = decoded._id;

//     // Check if the user with the decoded _id exists in the database
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(401).json({ error: 'User not found' });
//     }

//     // Attach the user object to the request object for later use
//     req.user = user;
//     next();
//   } catch (error) {
//     return res.status(401).json({ error: 'Invalid authorization token' });
//   }
// };

// exports.login = async (req, res, next) => {
//   try {
//     let { email, password } = req.body;
//     let user = await userModel.findOne({ email: email });
//     console.log(user);
//     if (user) {
     
//      let isCorrect = await comparePassword(password,user.password)
//       if (isCorrect) {
//         let uid = user._id;
//         let jwt_sign = jwt.sign({payload:uid},jwt_key) 
//         // res.setHeader('Set-Cookie', 'isLoggedin=true');
//         res.setHeader("Set-Cookie", `isLoggedin=${jwt_sign}; HttpOnly`);
//         console.log("User login successsful");

//         return res.json({
//           successMessage: "User login successful",
//           user: user,
//         });
//       } else {
//         console.log(password, user.password);
//         console.log("Wrong Password");
//         // return res.send(null);
//         return res.json({
//           errorMessage: "Wrong password",
//         });
//       }
//     } else {
//       console.log("No such email id exists");
//       // return res.send(null);

//       return res.json({
//         errorMessage: `No account is associated with this email id, please signUp first`,
//       });
//     }
//   } catch (err) {
//     if (err) console.log(err.message);
//     return res.json({
//       errorMessage: err.message,
//     });
//   }
// };
// exports.logout = async (req, res, next) => {
//   try {
//     let cookies = {};
//     if (req.headers.cookie) {
//       const cookiesArray = req.headers.cookie.split(";");

//       cookiesArray.forEach((cookie) => {
//         const [key, value] = cookie.trim().split("=");
//         cookies[key] = value;
//       });
//       console.log(cookies);
//       console.log(cookies["isLoggedin"]);
//       // res.json(cookies);
//       // console.log(req.cookies);
//       if (cookies["isLoggedin"]) {
//         res.setHeader("Set-Cookie", "isLoggedin=;HttpOnly;expires=Thu, 01 Jan 1970 00:00:00 GMT");
//         // console.log("user logged in verified");
//         // next();
//       }
//       return res.json({
//         successMessage: "You are successfully logged out",
//       });
//     }
//   } catch (err) {
//     if (err) console.log(err.message);
//     return res.json({
//       errorMessage: err.message,
//     });
//   }
// };
// exports.getUserById = async (req, res, next) => {
//   try {
//     const id = req.params["id"];
//     console.log(id);
//     let user = await userModel.findById(id);
//     console.log(user);
//     if (user) {
//       return res.json({
//         successMessage: "success",
//         user: user,
//       });
//     } else {
//       // return res.send(null);
//       return res.json({
//         errorMessage: "user not found",
//       });
//     }
//   } catch (err) {
//     if (err) console.log(err.message);
//     return res.json({
//       errorMessage: err.message,
//     });
//   }
// };





