const router=require("express").Router();
const pool=require('../db');
const bcrypt=require("bcrypt")
const jwtGenerator=require("../utils/jwtGenerator")
const validInfo = require("../middleware/validinfo")
const authorization = require("../middleware/authorization")


router.post('/register', validInfo,async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      const user = await pool.query("SELECT * FROM users WHERE user_email=$1", [email]);
      if (user.rows.length !== 0) {
        return res.status(401).send("User Already Exists"); // Return the response to avoid multiple responses
      }
  
      const saltRound = 10;
      const salt = await bcrypt.genSalt(saltRound);
      const bcryptedPassword = await bcrypt.hash(password, salt);
      const newUser = await pool.query("INSERT INTO users(user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *", [name, email, bcryptedPassword]);
      
      const token=jwtGenerator(newUser.rows[0].user_id);
      
  
      res.json({token});
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });

  router.post("/login",validInfo,async (req,res)=>{
    try {
      const {email,password}=req.body

      const user=await pool.query("SELECT * FROM users WHERE user_email=$1 ",[email])
      if (user.rows[0].length===0) {
        return res.status(401).send("Email or password Incorrect")
      }
      const validPassword= await bcrypt.compare(password, user.rows[0].user_password)
      if (!validPassword) {
        res.status(401).json("Email or password Incorret")
      }
      const token=jwtGenerator(user.rows[0].user_id)
      res.json({token})
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  })

  router.get("/is-verify",authorization,async (req,res)=>{
    console.log("I arrived here")
    try {
      res.json(true)
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  })
  
  module.exports = router;
  