// Place your server entry point code here
// Require minimist module
const args = require('minimist')(process.argv.slice(2))
// See what is stored in the object produced by minimist
console.log(args)
// Store help text 
const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

// Require Express.js
var express = require("express")
const app = express()
const db = require('./src/services/database.js')
const morgan = require('morgan')
const fs = require('fs')

// Add cors dependency
const cors = require('cors')
// Set up cors middleware on all endpoints
app.use(cors())

// Serve static HTML files
app.use(express.static('./public'));
// Allow JSON body messages on all endpoints
app.use(express.json())

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

args["port"];
var HTTP_PORT = args.port || 5000;

if(args.log == 'false') {
    console.log("Not creating a new access.log")
}
else {
    // Use morgan for logging to files
    // Create a write stream to append (flags: 'a') to a file
    const WRITESTREAM = fs.createWriteStream('./data/log/access.log', { flags: 'a' })
    // Set up the access logging middleware
    app.use(morgan('combined', { stream: WRITESTREAM }))
}

// Start an app server
const server = app.listen(HTTP_PORT, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',HTTP_PORT))
});

// Middleware
app.use( (req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }
    console.log(logdata)
    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referrer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referrer, logdata.useragent)
    next();
    })

if(args.debug === true) {
    app.get('/app/log/access/', (req, res) => {
        const stmt = db.prepare("SELECT * FROM accesslog").all()
        res.status(200).json(stmt)
    });
    app.get('/app/error', (req, res) => {
        throw new Error('Error test successful.')
    });
}   

/** Simple coin flip */
function coinFlip() {
    return (Math.floor(Math.random() * 2) == 0) ? "heads" : "tails";
  }

/** Multiple coin flips */
  function coinFlips(flips) {
    const results = [];
    for(let i = 0; i < flips; i++) {
      results[i] = coinFlip();
    }
    return results;
  }

  /** Count multiple flips */
  function countFlips(array) {
    let tails = 0;
    let heads = 0;
    for(let i = 0; i < array.length; i ++) {
      if(array[i] == "heads") {
        heads++;
      }
      else if(array[i] == "tails") {
        tails++;
      }
    }
    if(heads == 0) {
      return {tails: tails};
    }
    if(tails == 0) {
      return {heads: heads};
    }
    else {
      return {heads: heads, tails: tails};
    }
  }

 /** Flip a coin */
  function flipACoin(call) {
    var side = coinFlip();
    var result;
    if(call == side) {
      result = "win";
    }
    else {
      result = "lose";
    }
    return {call: call, flip: side, result: result};
  }

app.get('/app/', (req, res) => {
    res.json({"message":"Your API works! (200)"})
    res.status(200)
    });

app.get('/app/flip/', (req, res) => {
    // Respond with status 200
    res.statusCode = 200;
    res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
    res.end('{"flip":"' + coinFlip() + '"}')
    });

app.get('/app/flips/:number', (req, res) => {
    const flips = coinFlips(req.params.number)
    const count = countFlips(flips)
    res.status(200).json({"raw":flips,"summary":count})
    });

app.get('/app/flip/call/:guess(heads|tails)/', (req, res) => {
    const game = flipACoin(req.params.guess)
    res.status(200).json(game)
})    

// Flip a bunch of coins with one body variable (number)
app.post('/app/flip/coins/', (req, res, next) => {
  const flips = coinFlips(req.body.number)
  const count = countFlips(flips)
  res.status(200).json({"raw":flips,"summary":count})
})

app.post('/app/flip/call/', (req, res, next) => {
    const game = flipACoin(req.body.guess)
    res.status(200).json(game)
})

// Default response for any other request
app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});