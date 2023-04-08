exports.dangnhap = (req,res,next)=>{
    if(req.session.userLogin){
        next()
    }else{
        res.redirect('/Login.html')
    }
}