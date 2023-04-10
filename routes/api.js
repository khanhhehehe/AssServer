var express = require('express')
var router = express.Router()
const bodyParser = require('body-parser')
var fs = require('fs')
const path = require('path');
const multer = require('multer');
const mongodb = require('mongodb')
var usersModel = require('../model/UsersModel')
var indexControll = require('../controllers/index')
var userControll = require('../controllers/user.controller')
var productControll = require('../controllers/product.controller')
var profileControll = require('../controllers/profile.controller')
var checkLogin = require('../check_login/check')

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))
router.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
router.use("/css", express.static(path.join(__dirname, "../public/css")));


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
router.post('/changeImg', (req, res) => {
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
                res.redirect('listDataUser')
            } catch (error) {
                res.status(500).render('error', { message: error.message });
            }
        }
    })
})
router.post('/changeImguser', (req, res) => {
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
                res.render('myprofile', { thisUser: user, wrong: false, styless: 'none' })
            } catch (error) {
                res.status(500).render('error', { message: error.message });
            }
        }
    })
})
//-----------------------------------
router.get('/', (req, res) => {
    res.sendFile(__dirname + '/Register.html')
})
router.get('/Login.html', (req, res) => {
    res.sendFile(__dirname + '/Login.html')
})
router.post('/login', indexControll.Login)
router.post('/register', indexControll.Register)
router.get('/logout', indexControll.Logout)
//----------------Người dùng-----------------
router.get('/listDataUser', userControll.ListUser)
router.get('/listDataUserApp', userControll.ListUserApp)
router.get('/delete', userControll.DeleteUser)
router.post('/update', userControll.UpdateUser)
router.get('/filter', userControll.FilterUser)
router.post('/adduser', userControll.AddUser)
router.post('/updatePassword', userControll.UpdatePass)
//------------------sản phẩm------------------
router.get('/listPrs', productControll.ListProducts)
router.get('/deletePr', productControll.DeleteProduct)
router.post('/updatePr', productControll.UpdateProduct)
router.post('/addNewPr', productControll.AddProduct)
router.post('/changeImgProducts', productControll.ChangeImageProduct)
//-----------------------------------trang cá nhân-------------------------------
router.post('/updateProfile', profileControll.UpdateProfile)
router.post('/updatePass', profileControll.UpdatePass)
module.exports = router;