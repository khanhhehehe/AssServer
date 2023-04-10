const jwt = require('jsonwebtoken')
const userModel = require('../model/UsersModel');
require('dotenv').config();
const secretString = process.env.TOKEN_SEC_KEY;


const apiAuth = async (req, res, next) => {
    let header_token = req.header('Authorization');
    if (typeof (header_token) == 'undefined') {
        return res.status(403).json({ msg: 'Không xác định token' });
    }
    const token = header_token.replace('Bearer ', '')
    try {
        const data = jwt.verify(token, secretString)
        console.log(data);
        const user = await userModel.findOne({ _id: data._id, token: token })
        console.log(user);
        if (!user) {
            throw new Error("Không xác định được người dùng")
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        console.log(error);
        res.status(401).send({ error: error.message })
    }
}
module.exports = { apiAuth }