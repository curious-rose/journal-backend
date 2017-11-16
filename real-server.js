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
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '(If5wasagood)',
    database: 'curious_rose_journal',
    connectionLimit: 10
});
const dataLoader = new journalDataLoader(connection)


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
    console.log("getting entries for user", req.user.user_id)
    dataLoader.getJournalEntries(req.user.user_id).then(entries =>
        res.status(200).json(entries))
})
//again checks if the user is logged in, if not "screw off", if yes,
//sends back the correct journal entry, using the req.user.id(to find the user)
//and req.params.id (to find the specific entry ID)
//

app.get("/api/entries/:id", loggedInCheck, (req, res) => {
    
    dataLoader.getSingleEntry(req.params.id,req.user.user_id).then(entry=>
    {console.log("entry is ",entry)
     res.status(200).json(entry)})}
)

//creates a new row in the "users" table of the database


app.post("/api/entries", loggedInCheck, (req, res) => {
// so POST requests to this endpoint will have a JSON object in their body.
//that object will have 
    dataLoader.writeEntry(req.body.entryDataObj,req.user.user_id)
    console.log('writing entry to journal')
    res.status(200).json(result)
})

app.listen(process.env.PORT || 3000)