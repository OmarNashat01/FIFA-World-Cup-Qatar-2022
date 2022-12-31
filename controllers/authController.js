//const config = require("../config/auth.config");
const Users=require('../models/users');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const password = "Admin@123";

bcrypt.genSalt(saltRounds)
  .then(salt => {
    console.log('Salt: ', salt);
    return bcrypt.hash(password, salt)
  }).then(hash => {
    console.log('Hash: ', hash);
  }).catch(err => console.error(err.message))

exports.signup = async (req, res) => {
    try {
        const user = await Users.create({ ...req.body});
        if (!(user.username && user.pass && user.firstName && user.lastName && user.birthDate && user.gender && user.email && user.role)) {
            res.status(400).send("Please fill all required inputs");
        }

        const hashedPwd = await bcrypt.hash(req.body.pass, saltRounds);
        user.pass=hashedPwd;
        return res.json(user);
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
      }
};



exports.login =  async (req, res) => {
    try {
        let user
        if(req.body.username ){
        user = await Users.findOne({ username: req.body.username });

        if (!user) {
            throw new Error("User is not found");
          }

          const ismatch = await bcrypt.compare(req.body.pass, user.pass);
          if (ismatch) {
            throw new Error("Password is incorrect");
          }
      
          const token = await user.generateAuthToken();
      
          return res.json({ token, user });
        }
    }
    catch(err){
        return res.status(400).json({ message: err.message });
    }
}


