var usersModel = require('../model/UsersModel')
const mongodb = require('mongodb')
var bcrypt = require('bcrypt')
exports.UpdateProfile = async (req, res, next) => {
    let rs = req.body
    try {
        await usersModel.collection.updateOne({ _id: new mongodb.ObjectId(`${rs.idUserUp}`) }, { $set: { name: rs.name, email: rs.email } })
        let user = await usersModel.findOne({ _id: new mongodb.ObjectId(`${rs.idUserUp}`) }).lean()
        res.render('myprofile', { thisUser: user, wrong: false, styless: 'none' })
    } catch (error) {
        console.log(error);
    }
}
exports.UpdatePass = async (req, res, next) => {
    let rs = req.body
    try {
        let user = await usersModel.findOne({ _id: new mongodb.ObjectId(`${rs.idUserUp}`) }).lean()
        let checkPass = await bcrypt.compare(rs.oldpass, user.pass)
        if (checkPass) {
            let salt = await bcrypt.genSalt(10)
            let passHash = await bcrypt.hash(rs.newpass,salt)
            await usersModel.collection.updateOne({ _id: new mongodb.ObjectId(`${rs.idUserUp}`) }, { $set: { pass: passHash } })
            res.render('myprofile', { thisUser: user, wrong: true, textalert: 'Cập nhật mật khẩu thành công', styless: 'none' })
        } else {
            res.render('myprofile', { thisUser: user, wrong: false, textalert: 'Cập nhật mật khẩu thất bại', styless: 'inline' })
        }
    } catch (error) {
        console.log(error);
    }
}