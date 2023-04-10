var productModel = require('../model/ProductsModel')
var usersModel = require('../model/UsersModel')
const mongodb = require('mongodb')
const multer = require('multer');
var fs = require('fs')
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
exports.ListProducts = async (req, res, next) => {
    try {
        let list = await usersModel.find({ email: { $ne: 'admin@gmail.com' } }).lean()
        let listPr = await productModel.find().lean()
        res.render('listProducts', { listusers: list, listproducts: listPr })
    } catch (error) {
        console.log(error);
    }
}
exports.DeleteProduct = async (req, res, next) => {
    let rs = req.query.prNum
    try {
        await productModel.collection.deleteOne({ _id: new mongodb.ObjectId(`${rs}`) })
        res.redirect('listPrs')
    } catch (error) {
        console.log(error);
    }
}
exports.UpdateProduct = async (req, res, next) => {
    let rs = req.body
    try {
        let user = await usersModel.find({ _id: new mongodb.ObjectId(`${rs.usersUp}`) }).lean()
        await productModel.collection.updateOne({ _id: new mongodb.ObjectId(`${rs.idUpPr}`) }, { $set: { namePr: rs.namePr, price: rs.pricePr, color: rs.clPr, idUser: rs.usersUp, nameUser: user[0].name, typePr: rs.tPr } })
        res.redirect('listPrs')
    } catch (error) {

    }
}
exports.AddProduct = (req, res, next) => {
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
                res.redirect('listPrs')
            } catch (error) {
                res.status(500).render('error', { message: error.message });
            }
        }
    })
}
exports.ChangeImageProduct = (req, res, next) => {
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
                res.redirect('listPrs')
            } catch (error) {
                res.status(500).render('error', { message: error.message });
            }
        }
    })
}