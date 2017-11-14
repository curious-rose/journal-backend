# journal-backend

### Mockup Version
Documentation for the frontend folks: 

everything sent back in this mockup is *fake* 

there are currently only four endpoints:

**public(no authorisation needed)**:
* /api/create-account accepts a POST and sends back a user object
* /api/login accepts a POST and sends back a token "jambalaya123"

**private(need to be authorised)**:
* /api/entries accepts a GET and sends back an array of journal entries
* /api/entries/:id accepts a GET and sends back a single entry (only id #1 at the moment)

the two private pages require a *header* in the requests to them:

authorisation: *"literally whatever token"*

and then you'll be authorised to access those "private" pages. In the real version, this will need to be a specific token,
returned by the login request and stored in localstorage.
