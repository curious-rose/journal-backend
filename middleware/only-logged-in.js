module.exports = (req,res,next)=> {
    //this middleware sits on all private pages and checks if they're logged in.
    //if they're logged in, check-login-token checked their token and added a req.user object.
    //so there should be a req.user object. If so, we let them go ahead.
    //if not, we send them a 401 Unauthorised status and chastise them because we love them.
if(req.user)    
{next()}
else{res.status(401).send("hey you're not logged in")}
}