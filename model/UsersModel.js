const mongoose = require('mongoose')
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
    }
})
const UsersModel = new mongoose.model('user',UsersSchema)
module.exports = UsersModel 