// Imports
let express = require('express');
let bodyParser = require('body-parser');
let apiRouter = require('./apiRouter').router;

// Instantiate server
let server = express();

// Body Parser config
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());

// Config routes
server.get('/', (request, response) => {
    response.setHeader('Content-Type', 'application/json') // response.setHeader('Content-Type', 'text/html')
    response.status(200).send('<h1> Bonjour sur mon super serveur </h1>')
});

server.use('/myApi/', apiRouter);

// Launch server
server.listen(8000, () => {
    console.log('Server on')
});