const express = require('express');
const mongoose = require("mongoose")
const router = express.Router();
const userController = require('../controller/userController')



router.post("/register", userController.signup)
router.post("/login", userController.loginUser)
router.get("/getAllUsers", userController.getUser)
router.put("/updateUser/:userId", userController.updateUser)
router.put("/UserDeleted/:userId", userController.UserDeleted)

module.exports = router