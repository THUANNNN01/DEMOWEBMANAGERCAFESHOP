const express = require('express');
const { route } = require('express/lib/router');
const connection = require('../connection');
const route = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { use } = require('..');
require('dotenv').config(); 


route.post('/signup',(req,res) =>{
    let user = req.body;
    query = "select email,password,role,status from user where email=?"
    connection.query(query, [user.email], (err,result)=>{
        if(!err){
            if(result.length <= 0){
                query = "insert into user (name,contactNumber,email,password,status,role) value(?,?,?,?,'false','user')";
                connection.query(query,[user.name,user.contactNumber,user.email,user.password],(err, result) =>{
                    if(!err){
                        return res.status(200).json({message:"Successfully Registered"});
                    }
                    else{
                        return res.status(500).json(err);
                    }
                })
            }
            else{
                return res.status(400).json({message: "Emaily Already Exist."});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })

})

route.post('/login',(req, res)) => {
    const user = req.body;
    query = "select email,password,role,status from user where email=?";
    connection.query(query,[user.email],(err,result)=>{
        if(!err){
            if(result.length <= 0 || results[0].password !=user.password){
                return res.status(401).json({message:"Incorrect Username or password"});
            }
            else if(results[0].status === 'false'){
                return res.status(401).json({message: "Wait for Admin Approval"});
            }
            else if(results[0].password == user.password){
                const response = { email: results[0].email, role: result[0]}
                const accessToken = jwt.sign(response,process.env.ACCESS_TOKEN,{expiresIn: '8h' })
                res.status(200).json({token: accessToken});
            }
            else{
                return res.status(400).json({message:"Something went wrong.Please try again later"});
            }
        }
        else{
            return res.status(500).json(err);
        }
    }) 
}

var transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

router.post('/forgotPassword',(req,res)=>{
    const user = req.body;
    query = "select email, password from user where email=?";
    connection.query(query,[user.email],(err,result)=>{
        if(!err){
            if(result.length <= 0)
            {
                return res.status(200).json({message:"Password sent successfully to your email."});
            }
            else{
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'Password by Cafe Management System',
                    html: '<p><b>Your Login details for Cafe Management System</b><br><b>Email: </b>'+result[0].email+'<br><b>Password: </b>'+result[0].password+'<br><a href="http://localhost:4200/">Click here to login</a></p>'
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                    }
                    else{
                        console.log('Email sent: ' +info.response);
                    }
                });
                return res.status(200).json({message:"Password sent successfully to your email."});
            }

        }
        else{
            return res.status(500).json(err);
        }
    })
})


module.exports = router;