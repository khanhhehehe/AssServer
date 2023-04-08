var express = require('express')
var expressHbs = require('express-handlebars')
var fs = require('fs')
const multer = require('multer');
const bodyParser = require('body-parser')
const path = require('path');
const mongoose = require('mongoose')
const mongodb = require('mongodb')
const uri = require('./mylocalData')
const usersModel = require('./UsersModel');
const productModel = require('./ProductsModel')
var session = require('express-session')
var checkLogin = require('./check_login/check')
var app = express()
app.engine('.hbs', expressHbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts/',
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use("/uploads", express.static(path.join(__dirname, "./public/uploads")));
app.use("/css", express.static(path.join(__dirname, "./public/css")));
app.use(session({
    secret: 'NDFHnafidsfnadhf23nfsdhf23njNDFInn34djnfjkhanhhehehehehehehehehehe',
    resave: true,
    saveUninitialized: true
}))
app.set('view engine', '.hbs')

//image
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        dir = ('./public/uploads')
        fs.mkdirSync(dir, { recursive: true })
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        let filename = file.originalname
        let arr = filename.split('.')
        let dt = new Date
        let newFilename = arr[0] + '-' + dt.getFullYear() + (dt.getMonth() + 1) + dt.getDate() + dt.getHours() + dt.getMinutes() + '.' + arr[1]
        cb(null, newFilename)
    }
})
var upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        let arrFileName = file.originalname.split('.')
        if (!arrFileName[1].match('jpg|jpeg|png')) {
            req.fileValidationError = 'Chỉ được tải ảnh định dạng JPEG,PNG';
            return cb(null, false, new Error('Chỉ được tải ảnh định dạng JPEG,PNG'))
        }
        cb(null, true)
    }
}).array('imgRes', 2)
app.post('/changeImg', (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            res.status(500).render('error', { message: 'Lỗi tải tệp lên' });
        } else if (err) {
            res.status(500).render('error', { message: err.message });
        } else {
            if (req.fileValidationError) {
                return res.render('error', { message: 'Chỉ được tải ảnh!' });
            }
            let imgRes = req.files
            let { userNum } = req.body
            let img = ''
            try {
                let dt = new Date
                if (imgRes.length != 0) {
                    let arr = imgRes[0].originalname.split('.')
                    img = arr[0] + '-' + dt.getFullYear() + (dt.getMonth() + 1) + dt.getDate() + dt.getHours() + dt.getMinutes() + '.' + arr[1]
                }
                await usersModel.collection.updateOne({ _id: new mongodb.ObjectId(`${userNum}`) }, { $set: { image: img } })
                res.redirect('/listDataUser')
            } catch (error) {
                res.status(500).render('error', { message: error.message });
            }
        }
    })
})
app.post('/changeImguser', (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            res.status(500).render('error', { message: 'Lỗi tải tệp lên' });
        } else if (err) {
            res.status(500).render('error', { message: err.message });
        } else {
            if (req.fileValidationError) {
                return res.render('error', { message: 'Chỉ được tải ảnh!' });
            }
            let imgRes = req.files
            let { userNum } = req.body
            let img = ''
            try {
                let dt = new Date
                if (imgRes.length != 0) {
                    let arr = imgRes[0].originalname.split('.')
                    img = arr[0] + '-' + dt.getFullYear() + (dt.getMonth() + 1) + dt.getDate() + dt.getHours() + dt.getMinutes() + '.' + arr[1]
                }
                await usersModel.collection.updateOne({ _id: new mongodb.ObjectId(`${userNum}`) }, { $set: { image: img } })
                let user = await usersModel.findOne({ _id: new mongodb.ObjectId(`${userNum}`) }).lean()
                console.log(user);
                res.render('myprofile',{thisUser: user, wrong: false,styless: 'none'})
            } catch (error) {
                res.status(500).render('error', { message: error.message });
            }
        }
    })
})
//-----------------------------------
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Register.html')
})
app.get('/Login.html', (req, res) => {
    res.sendFile(__dirname + '/Login.html')
})
app.post('/login', async (req, res) => {
    let chk = req.query.wrong
    let { email, password } = req.body
    try {
        await mongoose.connect(uri)
        let user = await usersModel.findOne({ email: email, pass: password }).lean()
        console.log(user);
        console.log(email, password);
        if (user == null) {
            res.render('login', { wrong: true })
        } else if (user.email == 'admin@gmail.com' && user.pass == 'admin') {
            req.session.userLogin = user;
            res.redirect('/listDataUser')
        } else {
            if (chk) {
                wrong = true
            }
            req.session.userLogin = user;
            res.render('myprofile', { thisUser: user, wrong: false,styless: 'none' })
        }
    } catch (error) {
        console.log(error);
    }

})
app.post('/register', async (req, res) => {
    let { emailRes, nameRes, passRes } = req.body
    let img = 'user.png'
    try {
        await mongoose.connect(uri)
        let userFind = await usersModel.findOne({email: emailRes})
        if (userFind != null) {
            res.render('register',{checkMail: true})
        } else {
            let userNew = new usersModel({
                email: emailRes,
                name: nameRes,
                pass: passRes,
                image: img

            })
            await userNew.save()
            res.redirect('/Login.html')
        }
    } catch (error) {
        console.log(error);
    }
})
app.get('/listDataUser', checkLogin.dangnhap, async (req, res) => {
    await mongoose.connect(uri)
    try {
        let list = await usersModel.find({ email: { $ne: 'admin@gmail.com' } }).lean()
        res.render('home', { userData: list })
    } catch (error) {

    }
})
//----------------Người dùng-----------------
app.get('/delete', (req, res) => {
    let userNum = req.query.userNum
    try {
        usersModel.collection.deleteOne({ _id: new mongodb.ObjectId(`${userNum}`) })
        productModel.collection.deleteOne({idUser: userNum})
        res.redirect('/listDataUser')
    } catch (error) {
        console.log(error);
    }
})
app.post('/update', async (req, res) => {
    let rs = req.body
    try {
        await usersModel.collection.updateOne({ _id: new mongodb.ObjectId(`${rs.idUpUser}`) }, { $set: { email: rs.emailRes, name: rs.nameRes, pass: rs.passRes } })
        res.redirect('/listDataUser')
    } catch (error) {

    }
})
app.get('/filter', async (req, res) => {
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

})
app.post('/adduser', async (req, res) => {
    let rs = req.body
    let img = 'user.png'
    try {
        await mongoose.connect(uri)
        let userNew = new usersModel({
            email: rs.emailRes,
            name: rs.nameRes,
            pass: rs.passRes,
            image: img

        })
        await userNew.save()
        res.redirect('/listDataUser')
    } catch (error) {
        console.log(error);
    }
})
//------------------sản phẩm------------------
app.get('/listPrs', checkLogin.dangnhap, async (req, res) => {
    await mongoose.connect(uri)
    try {
        let list = await usersModel.find({ email: { $ne: 'admin@gmail.com' } }).lean()
        let listPr = await productModel.find().lean()
        res.render('listProducts', { listusers: list, listproducts: listPr })
    } catch (error) {

    }
})
app.get('/deletePr', async (req, res) => {
    let rs = req.query.prNum
    try {
        await productModel.collection.deleteOne({ _id: new mongodb.ObjectId(`${rs}`) })
        res.redirect('/listPrs')
    } catch (error) {

    }
})
app.post('/updatePr', async (req, res) => {
    let rs = req.body

    try {
        await mongoose.connect(uri)
        let user = await usersModel.find({ _id: new mongodb.ObjectId(`${rs.usersUp}`) }).lean()
        await productModel.collection.updateOne({ _id: new mongodb.ObjectId(`${rs.idUpPr}`) }, { $set: { namePr: rs.namePr, price: rs.pricePr, color: rs.clPr, idUser: rs.usersUp, nameUser: user[0].name, typePr: rs.tPr } })
        res.redirect('/listPrs')
    } catch (error) {

    }
})
app.post('/addNewPr', async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            res.status(500).render('error', { message: 'Lỗi tải tệp lên' });
        } else if (err) {
            res.status(500).render('error', { message: err.message });
        } else {
            if (req.fileValidationError) {
                return res.render('error', { message: 'Chỉ được tải ảnh!' });
            }
            let imgRes = req.files
            let { namePr, pricePr, clPr, idUser, tPr } = req.body
            let user = await usersModel.find({ _id: new mongodb.ObjectId(`${idUser}`) }).lean()
            let img = ''
            try {
                let dt = new Date
                if (imgRes.length != 0) {
                    let arr = imgRes[0].originalname.split('.')
                    img = arr[0] + '-' + dt.getFullYear() + (dt.getMonth() + 1) + dt.getDate() + dt.getHours() + dt.getMinutes() + '.' + arr[1]
                }
                let product = new productModel({
                    namePr: namePr,
                    price: pricePr,
                    imgPr: img,
                    color: clPr,
                    idUser: idUser,
                    nameUser: user[0].name,
                    typePr: tPr
                })
                await product.save()
                res.redirect('/listPrs')
            } catch (error) {
                res.status(500).render('error', { message: error.message });
            }
        }
    })
})
app.post('/changeImg/product', (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            res.status(500).render('error', { message: 'Lỗi tải tệp lên' });
        } else if (err) {
            res.status(500).render('error', { message: err.message });
        } else {
            if (req.fileValidationError) {
                return res.render('error', { message: 'Chỉ được tải ảnh!' });
            }
            let imgRes = req.files
            let { prNum } = req.body
            let img = ''
            try {
                let dt = new Date
                if (imgRes.length != 0) {
                    let arr = imgRes[0].originalname.split('.')
                    img = arr[0] + '-' + dt.getFullYear() + (dt.getMonth() + 1) + dt.getDate() + dt.getHours() + dt.getMinutes() + '.' + arr[1]
                }
                await productModel.collection.updateOne({ _id: new mongodb.ObjectId(`${prNum}`) }, { $set: { imgPr: img } })
                res.redirect('/listPrs')
            } catch (error) {
                res.status(500).render('error', { message: error.message });
            }
        }
    })
})
//-----------------------------------trang cá nhân-------------------------------
app.post('/updateProfile', async (req, res) => {
    let rs = req.body
    try {
        await usersModel.collection.updateOne({ _id: new mongodb.ObjectId(`${rs.idUserUp}`) }, { $set: { name: rs.name, email: rs.email } })
        let user = await usersModel.findOne({ _id: new mongodb.ObjectId(`${rs.idUserUp}`) }).lean()
        res.render('myprofile',{thisUser: user, wrong: false,styless: 'none'})
    } catch (error) {
        console.log(error);
    }
})
app.post('/updatePass', async (req, res) => {
    let rs = req.body
    try {
        let user = await usersModel.findOne({ _id: new mongodb.ObjectId(`${rs.idUserUp}`) }).lean()
        if (user.pass == rs.oldpass) {
            await usersModel.collection.updateOne({ _id: new mongodb.ObjectId(`${rs.idUserUp}`) }, { $set: { pass: rs.newpass } })
            res.render('myprofile', { thisUser: user, wrong: true, textalert: 'Cập nhật mật khẩu thành công', styless: 'none' })
        } else {
            res.render('myprofile', { thisUser: user, wrong: false, textalert: 'Cập nhật mật khẩu thất bại', styless: 'inline' })
        }
    } catch (error) {

    }
})
app.listen(3000, () => {
    console.log("Application started and Listening on port 3000");
})