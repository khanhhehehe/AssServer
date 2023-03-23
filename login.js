const { json } = require('express')
var express = require('express')
var expressHbs = require('express-handlebars')
var fs = require('fs')
const multer = require('multer');
const bodyParser = require('body-parser')
const path = require('path');
var app = express()
app.engine('.hbs', expressHbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts/',
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use("/uploads", express.static(path.join(__dirname, "./public/uploads")));
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
        let newFilename = arr[0] + '-' + Date.now() + '.' + arr[1]
        cb(null, newFilename)
    }
})
var upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        let arrFileName = file.originalname.split('.')
        if (!arrFileName[1].match('jpg|jpeg|png')) {
            return cb(new Error('Chỉ được tải ảnh định dạng JPEG,PNG'))
        }
        cb(null, true)
    }
}).array('imgRes', 2)
app.post('/changeImg', (req, res) => {
    res.render('upImg')
})
app.post('/changeImg/img', (req, res) => {
    let rs = req.body
    console.log(rs);
    upload(req, res, function (err) {
        console.log('thanh cong');
    })
    res.redirect('/listUsers')
})
//-----------------------------------
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Register.html')
})
app.get('/Login.html', (req, res) => {
    res.sendFile(__dirname + '/Login.html')
})
app.get('/login', (req, res) => {
    let email = req.query.email
    let pass = req.query.password
    let check = false
    fs.readFile('usersData.json', function (err, data) {
        // if (err) throw err
        let obj = JSON.parse(data)
        for (let i = 0; i < obj.length; i++) {
            if (email == obj[i].email && pass == obj[i].pass) {
                check = true
            }
        }
        if (check) {
            res.render('home', { layout: 'main', userData: obj })
        } else {
            res.render('login', { layout: 'main', wrong: true })
        }
    })
})


app.post('/register', (req, res) => {
    let dataUser = req.body
    fs.readFile('usersData.json', function (err, data) {

        let obj = JSON.parse(data)
        let da = fs.readFileSync('usersData.json')
        let myData = JSON.parse(da)
        let arr = dataUser.imgRes.split('.')
        let newFilename = arr[0] + '-' + Date.now() + '.' + arr[1]
        let newObj = { "id": obj[obj.length - 1].id + 1, "email": dataUser.emailRes, "name": dataUser.nameRes, "pass": dataUser.passRes, "image": "" }
        myData.push(newObj)
        let newData = JSON.stringify(myData)
        fs.writeFile('usersData.json', newData, function (err) {
            if (err) throw err;
            // upload(req, res, function (err) {
            //     console.log('thanh cong');
            // })
            res.render('login', { layout: 'main', wrong: false })
        })
        console.log(myData);
    })
})

app.get('/listUsers', (req, res) => {
    let emailUser = req.query.email
    let passUser = req.query.password
    let nameUser = req.query.name
    let imgUser = req.query.img
    let userNum = req.query.userNum
    fs.readFile('usersData.json', function (err, data) {
        if (!userNum) {
            let obj = JSON.parse(data)
            res.render('home', { layout: 'main', userData: obj })
        } else {
            let da = fs.readFileSync('usersData.json')
            let myData = JSON.parse(da)
            for (let i = 0; i < myData.length; i++) {
                if (myData[i].id == userNum) {
                    myData[i].email = emailUser
                    myData[i].pass = passUser
                    myData[i].name = nameUser
                    myData[i].image = imgUser
                    break
                }
            }
            let newData = JSON.stringify(myData)
            fs.writeFile('usersData.json', newData, function (err) {
                if (err) throw err;
                res.redirect('/listUsers')
            })
        }
    })
})
app.get('/delete', (req, res) => {
    let userNum = req.query.userNum

    fs.readFile('usersData.json', function (err, data) {
        let obj = JSON.parse(data)
        let da = fs.readFileSync('usersData.json')
        let myData = JSON.parse(da)
        let i = 0
        while (true) {
            if (myData[i].id == userNum) {
                myData.splice(i, 1)
                break
            }
            i++
        }
        let newData = JSON.stringify(myData)
        fs.writeFile('usersData.json', newData, function (err) {
            if (err) throw err;
            res.redirect('/listUsers')
        })
    })
})
app.get('/update', (req, res) => {
    let userNum = req.query.userNum
    fs.readFile('usersData.json', function (err, data) {
        let obj = JSON.parse(data)
        let da = fs.readFileSync('usersData.json')
        let myData = JSON.parse(da)
        let i = 0
        let upObj;
        while (true) {
            if (myData[i].id == userNum) {
                upObj = myData[i]
                break
            }
            i++
        }
        res.render('updateUser', { layout: 'main', user: upObj, index: userNum })
    })
})
app.get('/filter', (req, res) => {
    let sName = req.query.username
    let sEmail = req.query.email
    fs.readFile('usersData.json', function (err, data) {
        let obj = JSON.parse(data)
        let da = fs.readFileSync('usersData.json')
        let myData = JSON.parse(da)
        let arr = []
        for (let i = 0; i < myData.length; i++) {
            if (myData[i].name.search(sName) !== -1 && myData[i].email.search(sEmail) !== -1) {
                arr.push(myData[i])
            }
            console.log(arr);
        }
        res.render('home', { layout: 'main', userData: arr })
        // fs.writeFile('usersData.json', newData, function (err) {
        //     if (err) throw err;
        //     res.redirect('/listUsers')
        // })
    })
})
//Thêm người dùng
app.get('/addUser', (req, res) => {
    res.render('addUser', { layout: 'main' })
})
app.get('/addNew', (req, res) => {
    let emailRes = req.query.emailRes
    let passRes = req.query.passRes
    let nameRes = req.query.nameRes
    let imgRes = req.query.imgRes
    fs.readFile('usersData.json', function (err, data) {
        let obj = JSON.parse(data)
        let da = fs.readFileSync('usersData.json')
        let myData = JSON.parse(da)
        let newObj = { "id": obj[obj.length - 1].id + 1, "email": emailRes, "name": nameRes, "pass": passRes, "image": imgRes }
        myData.push(newObj)
        let newData = JSON.stringify(myData)
        fs.writeFile('usersData.json', newData, function (err) {
            if (err) throw err;
            res.redirect('/listUsers')
        })

    })
})
//------------------sản phẩm------------------
app.get('/listPrs', (req, res) => {
    let namePr = req.query.namePr
    let pricePr = req.query.pricePr
    let imgPr = req.query.imgPr
    let colorPr = req.query.clPr
    let typePr = req.query.tPr
    let idUser = req.query.idKHPr
    let prNum = req.query.prNum
    let newUser
    fs.readFile('productsData.json', function (err, data) {
        if (!prNum) {
            let obj = JSON.parse(data)
            res.render('listProducts', { layout: 'main', prData: obj })
        } else {
            let da = fs.readFileSync('productsData.json')
            let myData = JSON.parse(da)
            for (let i = 0; i < myData.length; i++) {
                if (myData[i].id == prNum) {
                    fs.readFile('usersData.json', function (err, data) {
                        let daU = fs.readFileSync('usersData.json')
                        let myDataU = JSON.parse(daU)
                        for (let j = 0; j < myDataU.length; j++) {
                            if (myDataU[j].id == idUser) {
                                myData[i].namePr = namePr
                                myData[i].price = parseInt(pricePr)
                                myData[i].imgPr = imgPr
                                myData[i].color = colorPr
                                myData[i].type = typePr
                                myData[i].idUser = parseInt(idUser)
                                myData[i].nameUser = myDataU[j].name
                                console.log("ok vao day" + myData[i].price);
                                let newData = JSON.stringify(myData)
                                fs.writeFile('productsData.json', newData, function (err) {
                                    if (err) throw err;
                                    res.redirect('/listPrs')
                                })
                                break
                            }
                            res.redirect('/listPrs')
                            break

                        }
                        console.log(namePr + " va " + pricePr);
                    })
                }
            }
        }

    })

})
app.get('/deletePr', (req, res) => {
    let prNum = req.query.prNum
    fs.readFile('productsData.json', function (err, data) {
        let obj = JSON.parse(data)
        let da = fs.readFileSync('productsData.json')
        let myData = JSON.parse(da)
        let i = 0
        while (true) {
            if (myData[i].id == prNum) {
                myData.splice(i, 1)
                break
            }
            i++
        }
        let newData = JSON.stringify(myData)
        fs.writeFile('productsData.json', newData, function (err) {
            if (err) throw err;
            res.redirect('/listPrs')
        })
    })
})
app.get('/updatePr', (req, res) => {
    let prNum = req.query.prNum
    fs.readFile('productsData.json', function (err, data) {
        let obj = JSON.parse(data)
        let da = fs.readFileSync('productsData.json')
        let myData = JSON.parse(da)
        let i = 0
        let upObj;
        while (true) {
            if (myData[i].id == prNum) {
                upObj = myData[i]
                break
            }
            i++
        }
        fs.readFile('usersData.json', function (err, data) {
            let da = fs.readFileSync('usersData.json')
            let myDataUsers = JSON.parse(da)
            res.render('updateProducts', { layout: 'main', user: upObj, index: prNum, listUsers: myDataUsers })
        })
    })
})
app.get('/addNewPr', (req, res) => {
    res.render('addProducts', { layout: 'main' })
})
app.post('/addNewPr/done', (req, res) => {
    fs.readFile('productsData.json', function (err, data) {
        let newPr = req.body
        let obj = JSON.parse(data)
        let da = fs.readFileSync('productsData.json')
        let myData = JSON.parse(da)
        fs.readFile('usersData.json', function (err, data) {
            let daU = fs.readFileSync('usersData.json')
            let myDataU = JSON.parse(daU)
            for (let j = 0; j < myDataU.length; j++) {
                if (myDataU[j].id == newPr.idKHPr) {
                    let newObj = { "id": obj[obj.length - 1].id + 1, "namePr": newPr.namePr, "price": newPr.pricePr, "imgPr": newPr.imgPr, "color": newPr.clPr, "type": newPr.tPr, "idUser": parseInt(newPr.idKHPr), "nameUser": myDataU[j].name }
                    myData.push(newObj)
                    console.log(myData);
                    let newData = JSON.stringify(myData)
                    fs.writeFile('productsData.json', newData, function (err) {
                        if (err) throw err;
                        res.redirect('/listPrs')
                    })
                    break
                }
            }
            console.log(newPr);

        })
    })
})
app.listen(3000, () => {
    console.log("Application started and Listening on port 3000");
})