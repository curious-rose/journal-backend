module.exports = (req, res, next) => {

    if (req.headers.authorisation) {
        const token = req.headers.authorisation
        req.token = token
        req.user = {
            firstName: "bashu",
            lastName: "naimi-roy",
            email: "bashu@gmail.com",
            password: 12345,
            createdAt: "2017-12-01 13:14:41",
            updatedAt: "2017-12-01 13:14:41"
        }
        //todo: check token in database Sessions table, if this is a valid token. If so,
        //get the user ID and pull the user record and set req.user to that.

    }

    console.log("middleware achieved")

    next()
    // res.status(400).json({"unauthorised":true})
}