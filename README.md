# journal-backend

Documentation for the frontend folks: 

currently only four endpoints:

**public(no authorisation needed)**:
* /api/create-account accepts a POST and sends back a user object
* /api/login accepts a POST and sends back a token

**private(need to be authorised)**:
* /api/entries accepts a GET and sends back an array of journal entries
* /api/entries/:id accepts a GET and sends back a
single entry (same one every time for now)

the two private pages require a *header* in the requests to them:
authorisation:"literally whatever token"
and then you'll be authorised to access those "private" pages.
