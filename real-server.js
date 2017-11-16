const express = require("express")
const mysql = require("promise-mysql")
const app = express()
const bodyParser = require("body-parser")
const morgan = require("morgan")
const checkLoginToken = require("./middleware/check-login-token.js")
const loggedInCheck = require("./middleware/only-logged-in.js")
const cors = require("cors");

const authController = require("./controllas/auth.js")
const journalDataLoader = require("./lib/dataLoader.js")
//somehow change this to pool using the env variable?
const connection = mysql.createConnection(
    
    process.env.CLEARDB_DATABASE_URL
    )
    .then(connection=> InitializeApp(new journalDataLoader(connection)))


function InitializeApp(dataLoader) {


    app.use(morgan('dev'))
    app.use(cors())
    //app.use(express.static('./'));
    app.use(bodyParser.json())
    app.use(checkLoginToken(dataLoader))
    app.use("/api/auth", authController(dataLoader))
    
    
    //this is a private page so we'll check if user is logged in
    //if they are, there will be a user object in the request object (req.user)
    //so we'll query the database with that user ID.
    app.get("/api/entries", loggedInCheck, (req, res) => {
        console.log("so I'm getting entries for user", req.user.user_id)
        dataLoader.getJournalEntries(req.user.user_id).then(entries =>
            res.status(200).json(entries))
    })
    //again checks if the user is logged in, if not "screw off", if yes,
    //sends back the correct journal entry, using the req.user.id(to find the user)
    //and req.params.id (to find the specific entry ID)
    //
    app.get("/api/auth/me", loggedInCheck,(req,res)=>
    
        res.status(200).json(req.user)

    
)
    app.get("/api/entries/:id", loggedInCheck, (req, res) => {
        console.log("so I'm looking for entry with id", req.params.id, "and seeing if it belongs to user", req.user.user_id)
        dataLoader.getSingleEntry(req.params.id, req.user.user_id).then(entry => {
            console.log("we found the entry:", entry)
            res.status(200).json(entry)
        })
            .catch(err => {
                console.log(err)
                return res.status(404).json(err)
    
            })
    
    }
    )
    
    app.post("/api/entries", loggedInCheck, (req, res) => {
        // so POST requests to this endpoint will have a JSON object in their body.
        //that object will have all entry fields.
        console.log(`writing an entry with the title:"${req.body.title}"`)
        dataLoader.writeEntry(req.body, req.user.user_id).then(
        result=>res.status(200).send("Successfully wrote an entry")
            
        )
    })
    
    app.listen(process.env.PORT || 3000)
}