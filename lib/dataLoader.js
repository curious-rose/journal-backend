const knex = require("knex")({
    client: 'mysql'
})
const bcrypt = require("bcrypt-as-promised")
const md5 = require('md5')
const util = require('./util')
const moment = require('moment')

class DataLoader {
    constructor(connection) {
        this.conn = connection;
    }

    query(queryString) {
        return this.conn.query(queryString)
    }

    getJournalEntries(userid, daysAgo, searchTerm, moodLimit) {

        console.log(
            "looking for all entries from", daysAgo, "days ago",
            searchTerm ? `with search term ${searchTerm}` : `with no search term`)

        let timeStampQuery = daysAgo===""? 0: moment().utc().subtract(daysAgo, "days").format()

        let queryString = searchTerm !=="" ?

            knex('entries')
                .select("id", "title", "mood", "createdAt", "lat", "lng", "thumbnail_image_url")
                .where("entries.user_id", userid)
                .andWhere("entries.createdAt", ">", timeStampQuery)
                .andWhere(function () {
                    this.where("entries.title", "like", `%${searchTerm}%`)
                        .orWhere("entries.q1a1", "like", `%${searchTerm}%`)
                        .orWhere("entries.q1a2", "like", `%${searchTerm}%`)
                        .orWhere("entries.q1a3", "like", `%${searchTerm}%`)
                        .orWhere("entries.q2", "like", `%${searchTerm}%`)
                        .orWhere("entries.q3", "like", `%${searchTerm}%`)
                        .orWhere("entries.q4", "like", `%${searchTerm}%`)
                })
                .orderBy("createdAt", "desc")
                .toString()

            :

            knex('entries')
                .select("id", "title", "mood", "createdAt", "lat", "lng", "thumbnail_image_url")
                .where("entries.user_id", userid)
                .andWhere("entries.createdAt", ">", timeStampQuery)
                .orderBy("createdAt", "desc")
                .toString()

        console.log("querying entries table with query:", queryString)

        return this.query(
            queryString
        )
    }
   
    getSingleEntry(entryid, userid) {
        let queryString = knex('entries').select("*")
            .where({
                "entries.id": entryid,
                "entries.user_id": userid
            })
            .toString();

        return this.query(queryString)
            .then(results => {
                if (results.length === 1) {
                    return results[0]
                } else {
                    throw new Error("You can't view this entry.")
                }
            })


    }
    writeEntry(entryDataObj, user_id) {
        let queryString = knex.insert({
            user_id: user_id,
            title: entryDataObj.title,
            mood: entryDataObj.mood,
            q1a1: entryDataObj.q1a1,
            q1a2: entryDataObj.q1a2,
            q1a3: entryDataObj.q1a3,
            q2: entryDataObj.q2,
            q3: entryDataObj.q3,
            q4: entryDataObj.q4,
            place:entryDataObj.place,
            special_question:entryDataObj.special_question,
            full_image_url: entryDataObj.full_image_url,
            thumbnail_image_url: entryDataObj.thumbnail_image_url,
            lat: entryDataObj.lat,
            lng: entryDataObj.lng

        })
            .into('entries').toString()
        return this.query(queryString
        )
    }

    editEntry(entryDataObj,user_id,entry_id){
        //this takes the incoming entry data object,
        //spreads the properties with a spread operator,
        //and does an update with those values.
        //I thought it would work with just .update(entryDataObj) but apparently not.
        let queryString = knex('entries')
        .update({...entryDataObj,
            updatedAt:moment.utc()}
        )
        .where({
            "entries.id":entry_id,
            "entries.user_id":user_id
        }).toString()
        console.log("updating with query",queryString)
        return this.query(queryString)
        
    }

    deleteEntry(entryid, userid) {
        let queryString = knex('entries').delete()
            .where({
                "entries.id": entryid,
                "entries.user_id": userid
            })
            .toString();

        return this.query(queryString)



    }

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
                //inserts the generated token into the sessions table
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
        //returns a user object with four fields if the token was valid. returns null if it wasn't.
        return this.query(
            knex.select("users.user_id", "users.firstName", "users.lastName", "users.email").from('sessions')
                .join("users", "sessions.user_id", "=", "users.user_id")
                .where({ 'sessions.token': token }).toString())
            .then(results => {
                if (results.length === 1) {
                    return results[0]
                } else {
                    return null;
                }
            })

    }
    deleteToken(token) {
        let queryString =
            knex.delete()
                .from("sessions")
                .where("token", token)
                .toString()
        return this.query(queryString)
    }

}
module.exports = DataLoader;