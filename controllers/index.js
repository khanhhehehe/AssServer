const { response } = require('express')
var usersModel = require('../model/UsersModel')
var bcrypt = require('bcrypt')
var request = require('request')

exports.Register = async (req, res, next) => {
    let { emailRes, nameRes, passRes } = req.body
    let img = 'user.png'
    try {
        let userFind = await usersModel.findOne({ email: emailRes })
        if (userFind != null) {
            res.render('register', { checkMail: true })
        } else {
            let salt = await bcrypt.genSalt(10)
            let passHash = await bcrypt.hash(passRes, salt)
            let userNew = new usersModel({
                email: emailRes,
                name: nameRes,
                pass: passHash,
                image: img

            })
            await userNew.generateAuthToken()
            await userNew.save()
            res.redirect('Login.html')
            // return res.status(201).json({ user: new_u, token })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng ký' })
    }
}
exports.Login = async (req, res, next) => {
    let isRequestComplete = false
    let { email, password } = req.body
    try {
        let user = await usersModel.findByCredentials(email, password)
        if (user == null) {
            res.render('login.hbs', { wrong: true })
        } else {
            let checkPass = await bcrypt.compare(password, user.pass)
            if (checkPass) {
                if (user.email == 'admin@gmail.com') {
                    let token = await user.generateAuthToken()
                    // request({
                    //     url: 'http://localhost:3000/api/listDataUser',
                    //     headers: {
                    //         'Authorization': 'Bearer ' + token
                    //     },
                    //     rejectUnauthorized: false
                    // }, function (err, response) {
                    //     if (err) {
                    //         return console.error(err);
                    //     } else {
                    //         console.log(response.body);
                    //         res.write(response.body)
                    //         res.end()
                    //         isRequestComplete = true;
                    //     }
                    // });
                    return res.redirect('listDataUser')
                }
                // if (!isRequestComplete) {
                //     return;
                // }
                await user.generateAuthToken()
                let profileUser = { _id: user._id, name: user.name, email: user.email, image: user.image }
                return res.render('myprofile', { thisUser: profileUser, wrong: false, styless: 'none' })
            } else {
                res.redirect('Login.html')
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message)
    }
}
exports.Logout = async (req, res, next) => {
    try {
        console.log(req.user);
        req.user.token = null;
        await req.user.save()
        return res.redirect('Login.html')
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message)
    }
}