const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const morgan = require("morgan")
const tokenCheck = require("./middleware/check-login-token.js")
const loggedInCheck = require("./middleware/only-logged-in.js")
const cors = require("cors");

app.use(morgan('dev'))
app.use(cors())
//app.use(express.static('./'));
app.use(bodyParser.json())
app.use(tokenCheck)

//this is a private page so we'll check if user is logged in
//if they are, there will be a user object in the request object (req.user)
//so we'll query the database with that user ID.
app.get("/api/entries", loggedInCheck, (req, res) => (res.status(200).json({
    entries: [{
        id: 1,
        journal_id: 1,
        contents: "today was a good day",
        mood: 9,
        createdAt: "2017-11-01 13:14:41",
        updatedAt: "2017-11-01 13:14:41"
    },
    {
        id: 2,
        journal_id: 1,
        contents: "today was a bad day",
        mood: 1,
        createdAt: "2017-11-02 13:14:41",
        updatedAt: "2017-11-02 13:14:41"
    },
    {
        id: 3,
        journal_id: 1,
        contents: "today was also a good day",
        mood: 8,
        createdAt: "2017-11-03 13:14:41",
        updatedAt: "2017-11-03 13:14:41"
    }
    ]
})))
//again checks if the user is logged in, if not "screw off", if yes,
//sends back the correct journal entry, using the req.user.id(to find the user)
//and req.params.id (to find the specific entry ID)
//

app.get("/api/entries/:id", loggedInCheck, (req, res) => res.status(200).json({
    id: 1,
    journal_id: 1,
    contents: "today was a good day",
    mood: 9,
    createdAt: "2017-11-01 13:14:41",
    updatedAt: "2017-11-01 13:14:41"
}))

//creates a new row in the "users" table of the database

app.get("/api/auth/me", (req, res) => res.send({
     user_id: 1,
     firstName: "cors", 
     lastName: "lite", 
     email: "corslite@gmail.com", 
     avatar_url: "gravatar.com/blablabla" }))

app.post("/api/auth/create-account", (req, res) => {
    res.status(200).json({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        createdAt: "2017-12-01 13:14:41",
        updatedAt: "2017-12-01 13:14:41"
    })
})


app.post("/api/auth/login", (req, res) => {

    //checks the user's login info with bcrypt. If it's correct, makes a row in the "sessions" table
    //with that user's id and a randomised token. sends that token back in the response, to store in localstorage.
    //that token will let them access private pages. be valid until expiry (30 mins)
    //or until user logs out. Then they have to log in to get another one.

    //should accept "email" and "password" as login info

    console.log("user is ", req.user)
    res.status(200).json({
        token: "jambalaya123"
    })
})



app.post("/api/entries", loggedInCheck, (req, res) => {
    //returns the new journal entry object. 
    //in the real version, will place a new row in the entries table, with the id auto-incremented and
    //journal_id according to the logged-in user's journal ID. 
    console.log('writing entry to journal')
    res.status(200).json({
        id: 1,
        journal_id: 1,
        contents: req.body.contents,
        mood: req.body.mood,
        createdAt: "2017-11-31 13:31:45",
        updatedAt: "2017-11-31 13:31:45"

    })
})

app.listen(process.env.PORT || 3000)