const express = require("express")

module.exports = (dataLoader) => {
    const authController = express.Router();

    authController.post("/create-account", (req, res) => {
        dataLoader.createAccount(
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password
            }
        ).then((userObj) => {
            console.log("returned user object:", userObj)
            res.status(200).json(
                userObj
            )
        }).catch(err => {
            console.log(err)
            return res.status(401).json(err)
        }
            )

    })

    authController.delete("/logout", (req, res) => {
        console.log("authController: logging out user", req.user.user_id, "and deleting token", req.token)
        dataLoader.deleteToken(req.token).then(
            response=>{
                if (response.affectedRows > 0) {
                    res.status(200).send("successfully logged out")
                }
                else {
                    res.status(404).send("token wasn't deleted")
                }
            }
        )
    }
    )
    authController.post("/login", (req, res) => {
        console.log("authController: posting to login with credentials", req.body)
        dataLoader.createToken(
            req.body.email,
            req.body.password
        ).then((token) =>

            res.status(201).json({ token })
            ).catch(err => {
                console.log(err)
                res.status(401).json(err)
            })
    })
    return authController;



}