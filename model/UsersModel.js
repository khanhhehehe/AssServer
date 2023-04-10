const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const secretString = process.env.TOKEN_SEC_KEY
const bcrypt = require('bcrypt')
const UsersSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    pass: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    token: {
        type: String,
        required: false
    }
})
UsersSchema.methods.generateAuthToken = async function () {
    const user = this
    console.log("usermodel: "+user)
    const token = jwt.sign({ _id: user._id, username: user.name }, secretString)
    user.token = token;
    await user.save()
    return token
}
UsersSchema.statics.findByCredentials = async (email, pass) => {
    const user = await UsersModel.findOne({ email })
    if (!user) {
        throw new Error({ error: 'Không tồn tại user' })
    }
    const isPasswordMatch = await bcrypt.compare(pass, user.pass)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Sai password' })
    }
    return user
}
const UsersModel = new mongoose.model('user', UsersSchema)
module.exports = UsersModel 