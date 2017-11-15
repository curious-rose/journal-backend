const knex = require("knex")({
    client: 'mysql'
})
const bcrypt = require("bcrypt-as-promised")
const md5 = require('md5')
const util = require('./util')

class DataLoader {
    constructor(connection) {
        this.conn = connection;
    }

    query(queryString) {
        return this.conn.query(queryString)
    }

    getJournalEntries(userid) {
        let queryString = knex('entries').select("*")
            .join("journals", "entries.journal_id", "=", "journals.id")
            .where({
                "journals.user_id": userid
            })
            .toString();

        return this.query(queryString)
    }
    getSingleEntry(entryid,userid){
        let queryString = knex('entries').select("*")
            .join("journals", "entries.journal_id", "=", "journals.id")
            .where({
                "journals.user_id": userid,
                "entries.id": entryid
            })
            .toString();

        return this.query(queryString)
    }
    // writeEntry(entryDataObj){
    //     return this.query(
    //                 knex.insert({
    //                     q0: entryDataObj.q0,
    //                     q1a1: entryDataObj.q1a1,
    //                     q1a2: entryDataObj.q1a2,
    //                     q1a3: entryDataObj.q1a3,
    //                     q1a4: entryDataObj.q1a4,
    //                     q2: entryDataObj.q2,
    //                     q3: entryDataObj.q3,
    //                     q4: entryDataObj.q4,

                        
    //                 })
    //                 //Fix This Right Away
    //                 .into('entries').toString())
    // }

    createAccount(userDataObj) {
        //todo: validate the data passed in
        return bcrypt.hash(userDataObj.password, 10)
            .then(hashedpassword => {
                return this.query(
                    knex.insert({
                        email: userDataObj.email,
                        password: hashedpassword,
                        firstName: userDataObj.firstName,
                        lastName: userDataObj.lastName
                    })
                    .into('users').toString())


            }).then(response => {
                return this.query(
                    knex.select("*").from('users').where('user_id', response.insertId).toString()
                )

            }).then(user => {
                var hash = md5(userDataObj.email)
                var url = `https://gravatar.com/avatar/${hash}`
                user[0].avatarUrl = url;
                return user[0];
            })
            .catch(err => {
                console.log(err)
                if (err.code === 'ER_DUP_ENTRY') {
                    throw new Error('a user with this email already exists')
                } else {
                    throw err
                }
            })
    }
    createToken(email, password) {
        //todo: validate the data passed in
        let sessionToken;
        let user;
        return this.query(
                knex.select('user_id', 'password')
                .from('users')
                .where('email', email)
                .toString()
            ).then(
                (results) => {
                    if (results.length === 1) {
                        user = results[0]
                        //evil bcrypt magic???
                        return bcrypt.compare(password, user.password)
                            .catch(() => false)
                    }
                    return false;
                })
            .then((result) => {
                if (result === true) {
                    //if there was a user with the email passed in,
                    //and if that password matched the password passed in
                    return util.getRandomToken();
                }
                //but if not...
                throw new Error('Username or password invalid')
            })
            .then(token => {
                console.log("user variable is ", user)
                sessionToken = token;
                return this.query(
                    knex.insert({
                        user_id: user.user_id,
                        token: sessionToken
                    })
                    .into('sessions')
                    .toString()
                )
            }).then(() => sessionToken)


    }
    checkToken(token) {
        //returns a user object
        //todo
        return this.query(
                knex.select("user_id").from('sessions').where('token', token).toString())
            .then(results => {
                if (results.length === 1) {
                    return results[0]
                } else {
                    throw new Error("You are logged out - please log in again")
                }
            })
            .then((user) => 
            {console.log("the user_id is", user.user_id)
               return this.query(
                  knex.select("*").from("users").where('user_id', user.user_id).toString())})
            .then(results => {
                if (results.length === 1) {
                    return results[0]
                } else {
                    throw new Error("Valid token but doesn't correspond to a user account")
                }
            })
    }

}
module.exports = DataLoader;