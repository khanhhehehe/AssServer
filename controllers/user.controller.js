var usersModel = require('../model/UsersModel')
var productModel = require('../model/ProductsModel')
const mongodb = require('mongodb')
var bcrypt = require('bcrypt')

exports.ListUser = async (req, res, next) => {
    try {
        console.log("listuser--------------");
        console.log(req.token);
        let list = await usersModel.find({ email: { $ne: 'admin@gmail.com' } }).lean()
        return res.render('home', { userData: list })
        // return res.send(list)
    } catch (error) {
        console.log(error);
    }
}
exports.ListUserApp = async (req, res, next) => {
    try {
        console.log("listuser--------------");
        console.log(req.token);
        // await fetch("http://localhost:3000/api/listDataUser", {
        //     method: 'GET',
        //     headers: {
        //         'Authorization': req.token
        //     }
        // })
        let list = await usersModel.find({ email: { $ne: 'admin@gmail.com' } }).lean()
        // return res.render('home', { userData: list })
        return res.send(list)
    } catch (error) {
        console.log(error);
    }
}
exports.AddUser = async (req, res, next) => {
    let rs = req.body
    let img = 'user.png'
    try {
        console.log(rs);
        let salt = await bcrypt.genSalt(10)
        let passHash = await bcrypt.hash(rs.passRes, salt)
        let userNew = new usersModel({
            email: rs.emailRes,
            name: rs.nameRes,
            pass: passHash,
            image: img

        })
        await userNew.save()

        // request({
        //     url: 'http://localhost:3000/api/listDataUser',
        //     headers: {
        //         'Authorization': 'Bearer ' + req.token
        //     },
        //     rejectUnauthorized: false
        // }, function (err, response) {
        //     if (err) {
        //         return console.error(err);
        //     } else {
        //         console.log(response.body);
        //         res.write(response.body)
        //         res.end()
        //         // isRequestComplete = true;
        //     }
        // });

        res.redirect('listDataUser')
    } catch (error) {
        console.log(error);
    }
}
exports.DeleteUser = async (req, res, next) => {
    let userNum = req.query.userNum
    try {
        await usersModel.collection.deleteOne({ _id: new mongodb.ObjectId(`${userNum}`) })
        await productModel.collection.deleteOne({ idUser: userNum })
        res.redirect('listDataUser')
    } catch (error) {
        console.log(error);
    }
}
exports.UpdateUser = async (req, res, next) => {
    let rs = req.body
    console.log(rs);
    try {
        await usersModel.collection.updateOne({ _id: new mongodb.ObjectId(`${rs.idUpUser}`) }, { $set: { email: rs.emailRes, name: rs.nameRes } })
        res.redirect('listDataUser')
    } catch (error) {
        console.log(error);
    }
}
exports.FilterUser = async (req, res, next) => {
    let sName = req.query.username
    let sEmail = req.query.email
    let arr = []
    let stringNull = false;
    try {
        let myData = await usersModel.find({ email: { $ne: 'admin@gmail.com' } }).lean()
        for (let i = 0; i < myData.length; i++) {
            if (myData[i].name.search(sName) !== -1 && myData[i].email.search(sEmail) !== -1) {
                arr.push(myData[i])
            }
        }
        if (arr.length != 0) {
            stringNull = true
        }
        console.log(arr);
        res.render('home', { userData: arr })
    } catch (error) {
        console.log(error);
    }
}
exports.UpdatePass = async (req, res, next) => {
    let rs = req.body
    try {
        let salt = await bcrypt.genSalt(10)
        let passHash = await bcrypt.hash(rs.passRes, salt)
        await usersModel.collection.updateOne({ _id: new mongodb.ObjectId(`${rs.idUpUser}`) }, { $set: { pass: passHash } })
        res.redirect('listDataUser')
    } catch (error) {
        console.log(error);
    }
}