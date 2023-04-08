var usersModel = require('../UsersModel')
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
            await userNew.save()
            res.redirect('Login.html')
        }
    } catch (error) {
        console.log(error);
    }
}