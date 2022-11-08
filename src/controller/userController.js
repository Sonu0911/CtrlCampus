const userModel = require("../model/userModel")
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const signup = async function(req, res) {
    try {
        let data = req.body
        if (Object.keys(data) == 0) return res.status(400).send({ status: false, msg: "No input provided" })

        const { fname, lname, phone, email,password} = data

        if (!fname) {
            return res.status(400).send({ status: false, msg: "fname is required" })
        }

        if (!lname) {
            return res.status(400).send({ status: false, msg: "lname is required" })
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).send({ status: false, msg: "valid phone number is required" })
        }

        if (!/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, msg: "valid email is required" })
        }

        
        if (!password) {
            return res.status(400).send({ status: false, msg: "Plz enter valid password" })
        }
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, msg: "passowrd min length is 8 and max len is 15" })
        }
    

        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt)

     
        let dupliPhone = await userModel.find({ phone: phone })
        if (dupliPhone.length > 0) {
            return res.status(400).send({ status: false, msg: "phone number already exits" })
        }

        let dupliEmail = await userModel.find({ email: email })
        if (dupliEmail.length > 0) {
            return res.status(400).send({ status: false, msg: "email is already exists" })
        }


        let savedData = await userModel.create(data)
        return res.status(201).send({
            status: true,
            msg: "user created successfully",
            data: savedData
        })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


const loginUser = async function(req, res) {
    try {
        let user = req.body

        if (Object.keys(user) == 0) {
            return res.status(400).send({
                status: false,
                msg: "please provide data"
            })
        }

        let userName = req.body.email
        let password = req.body.password

        if (!userName) {
            return res.status(400).send({
                status: false,
                msg: "userName is required"
            })
        }

        if (!password) {
            return res.status(400).send({
                status: false,
                msg: "password is required"
            })
        }


        let userEmailFind = await userModel.findOne({ email: userName })
        if (!userEmailFind) {
            return res.status(400).send({
                status: false,
                msg: "userName is not correct"
            })
        };


        bcrypt.compare(password, userEmailFind.password, function(err, result) {
            if (result) {
                let token = jwt.sign({
                    userId: userEmailFind._id,
          
                }, "rushi-159");

                const userData = {
                    userId: userEmailFind._id,
                    token: token
                }
                res.status(200).send({
                    status: true,
                    message: "user login successfully",
                    data: userData
                });
            } else {
                return res.status(401).send({
                    status: true,
                    message: "plz provide correct password"
                })
            }
        })


    } catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }

}



const getUser = async function(req, res) {
    
        try {
            let findAllUsers = await userModel.find({ isDeleted: false })

           return res.status(200).send({ status: true, message: "List of all users", data: findAllUsers })

        } catch (err) {
            res.status(400).send({status:false, message:err.message})
        }
    
    
}

const updateUser = async function(req, res) {
    try {
        userId = req.params.userId

        if (Object.keys(userId).length == 0) {
            return res.status(400).send({ status: false, msg: "please provide input" })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "please provide a valid userId" })
        }

        const userAvailable = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!userAvailable) {
            return res.status(400).send({ status: false, msg: "no contact found" })
        }

        let obj = {}
        data = req.body
        const { fname,lname,phone, email, password} = data

        if (fname) {
            if (!(fname)) {
                return res.status.send({ status: false, msg: "enter valid Id" })
            }
          
            obj.fname = fname.trim()
        }


        if (lname) {
            if (!(lname)) {
                return res.status(400).send({ status: false, msg: "enter valid lname " })
            }
            obj.lname = lname.trim()
        }

        if (phone) {
            if (!(phone)) {
                return res.status(400).send({ status: false, msg: "enter valid phone" })
            }
            obj.phone = phone
        }

        if (email) {
            if (!(email)) {
                return res.status(400).send({ status: false, msg: "enter valid email" })
            }
            obj.email = email.trim()
            
        }if (password) {
            if (!(password)) {
                return res.status(400).send({ status: false, msg: "enter valid password" })
            }
            obj.password = password.trim()
        }

        const updatedUser= await userModel.findByIdAndUpdate({ _id: userId }, { $set: obj }, { new: true })

        return res.status(200).send({ status: true, msg: "Updated contact", data: updatedUser })


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const UserDeleted = async function(req, res) {
    try {
        let userId = req.params.userId.trim()

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid UserId" })
        }

        const UserFind = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!UserFind) {
            return res.status(404).send({ status: false, msg: "UserId is already deleted" })
        }

      
 
        const UserDeleted = await userModel.findOneAndUpdate({ _id: userId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
        return res.status(200).send({ status: true, msg: "User is deleted", data: UserDeleted })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}


module.exports.signup = signup
module.exports.loginUser = loginUser
module.exports.getUser=getUser
module.exports.updateUser=updateUser
module.exports.UserDeleted=UserDeleted