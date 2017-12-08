# journal-backend

This is the back-end portion of NoctJournal, a short-form journalling web app designed and built over the course of 9 days as a final project by a team of 3 students in the DecodeMTL Web Developer Bootcamp. 

The back-end portion consists of a server and middleware (written in Node.js and powered by express.JS) and a database wrapper, using [Knex](knexjs.org) to query a mySQL database for storing and retrieving authentication data and user-input data.

It is designed to be deployed on heroku (and currently is, at https://glacial-dawn-27724.herokuapp.com/)
and queried by the front-end of the NoctJournal app (which can be seen and cloned at https://github.com/bashunaimiroy/journal-frontend).

A fairly bare documentation is below:

### Documentation

#### Data Model

There are 4 tables in the database: "users", "entries", "sessions", and "journals". 
Only the first 3 are used for the purposes of this version; the "journals" table is for future implementations of a multiple-journals-per-user feature.

The Entries and Sessions table both have a foreign key, "user_id", referencing the primary key in the "users" table, also called "user_id" for consistency. 
Sessions contains two columns- the aforementioned foreign key and a "token" column containing generated tokens which are used for authentication as described below. 
Entries has one row for each journal entry created by a user. There are several fields for user-input text, a lat and lng for geolocation, timestamps for creation and updating, as well as thumbnail_image_url & full_image_url fields. Each entry also has an id of its own.

#### Server Endpoints

These are divided into public and private. The only two public endpoints are for obtaining authentication (in the form of valid user credentials, and a valid token). After this authentication is obtained and the token generated and placed in the database, it can be used to access the private endpoints. The private pages require a valid token, placed in a *header* in the requests to them. 

It will look like this: authorisation: *your token*.


**public(no authorisation needed)**:
* /api/auth/create-account accepts a POST with a JSON body containing user info and sends back a user object, representing
the user info which has been stored in the database (except for now-hashed password).
* /api/auth/login accepts a POST with a JSON body containing user credentials, and sends back a token

**private(token required)**
* /api/entries accepts a GET and sends back an array of objects representing journal entries. The headers to this GET request 
may include, besides authentication, a "searchterm" field and a "days" field, which are used to query the database for a specific set of entries.
* /api/entries also accepts a POST with a JSON body containing entry info, representing the creation of a new entry, 
and sends back a confirmation message.

* /api/entries/:id accepts a GET and sends back a single entry object
* /api/entries/:id also accepts a DELETE and sends back a confirmation or rejection message.
* /api/entries/:id also accepts a POST with a JSON body containing entry info, representing an edit action on the entry at that address,
and sends back a confirmation or rejection message.
* /api/auth/me accepts a GET request and sends back the current user Object, which is used by the front end to confirm potentially updated user info
* /api/auth/logout accepts a DELETE request and deletes the current token from the database, so that the user will have to log in again in order to access private resources. It sends back a confirmation or rejection message.


