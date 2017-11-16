module.exports = (dataLoader) => (req, res, next) => {
    //this middleware looks at every request.
    //there will only be an authorisation header in the request
    //if the request is for a private page. 
    if (req.headers.authorisation) {
        const token = req.headers.authorisation;
        console.log("now checking token", token)
        //todo: check token in database Sessions table, if this is a valid token. If so,
        //get the user ID and pull the user record and set req.user to that.
       dataLoader.checkToken(token).then(
           //checks if there is a valid user object returned. if it's null, it means that 
           //it was not a valid token
            (user) => {
                if(user){
                console.log("that token belongs to user", user.user_id)
                req.token = token;
                req.user = user}
                //goes to the next middleware either way
                next()
            })
        // .catch(err=>{
        //     console.log("we got an error from the checktoken",err)
        //     res.status(401).json(err)
        // })
    }
    else{next()}

   
}