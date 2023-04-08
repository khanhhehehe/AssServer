const mongoose = require('mongoose')
const ProductsSchema = new mongoose.Schema({
    namePr: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imgPr:{
        type: String,
        default: ''
    },
    color:{
        type: String,
        default: 'Chưa cập nhật'
    },
    idUser:{
        type: String,
        required: true
    },
    nameUser:{
        type: String,
        required: true
    },
    typePr:{
        type: String,
        default: 'Chưa cập nhật'
    }
})
const ProductsModel = new mongoose.model('product',ProductsSchema)
module.exports = ProductsModel