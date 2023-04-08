var express = require('express')
var router = express.Router()
const bodyParser = require('body-parser')




router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))
