module.exports = (dataLoader) => (req, res, next) => {
    if (req.headers.authorisation) {
        const token = req.headers.authorisation;
        console.log("now checking token", token)
        //todo: check token in database Sessions table, if this is a valid token. If so,
        //get the user ID and pull the user record and set req.user to that.
       dataLoader.checkToken(token).then(
            (user) => {
                if(user){
                console.log("token matched with user id:", user)
                req.token = token;
                req.user = user}
                next()
            }
        ).catch(err=>{
            console.log("we got an error from the checktoken",err)
            res.status(401).json(err)
        })
    }
    else{next()}

   
}