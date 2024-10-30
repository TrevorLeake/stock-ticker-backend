/*
  Websocket server with express.js
  (https://www.npmjs.com/package/express) and ws.js
  (https://www.npmjs.com/package/ws)
  Serves an index page from /public. That page makes
  a websocket client back to this server.

  created 17 Jan 2021
  modified 23 Feb 2023
  by Tom Igoe
*/
// include express, http, and ws libraries:
var fs = require('fs');
const express = require("express");
const fetch = require('node-fetch');
// the const {} syntax is called destructuring.
// it allows you to pull just the one function 
// you need from the libraries below without 
// making an instance of the whole library:
const {createServer} = require("http");
const {WebSocketServer} = require("ws");
const {URLSearchParams} = require('url');

// make an instance of express:
const app = express();
// serve static content from the project's public folder:
app.use(express.static("public"));
// make an instance of http server using express instance:
const server = createServer(app);
// WebSocketServer needs the http server instance:
const wss = new WebSocketServer({ server });
// list of client connections:
var clients = new Array();

// this runs after the http server successfully starts:
function serverStart() {
  var port = this.address().port;
  console.log("Server listening on port " + port);
}

// this handles websocket connections:
function handleClient(thisClient, request) {
  // you have a new client
  console.log("New Connection"); 
  // add this client to the clients array

  clients.push(thisClient); 
  
  function endClient() {
    // when a client closes its connection
    // get the client's position in the array
    // and delete it from the array:
    var position = clients.indexOf(thisClient);
    clients.splice(position, 1);
    console.log("connection closed");
  }
  const STOCK_API_KEY = 'YXVREILRG39VDJZI' // alphavantage.co

  // if a client sends a message, print it out:
  async function clientResponse(message) {
    const stockSymbol = message.toString() 
    const data = await getStock(stockSymbol)
    // broadcast();
    console.log(`sending list with ${data.length} elements`)

    thisClient.send(JSON.stringify(data))
  }

  // This function broadcasts messages to all webSocket clients
  function broadcast(data) {
    // iterate over the array of clients & send data to each
    for (let c in clients) {
      clients[c].send(data);
    }
  }

  async function getStock(symbol) {
    console.log('client requested information on', symbol)
    const n = []
    let data

    if(true) // ADD NO API FLAG
    {
        data = require('./alphavantage.json');
        // load json objects instead of api...
        // data = JSON.parse(fs.readFileSync('./src/alphavantage.json', 'utf8'));
    }
    else {
        const response = await fetch('https://www.alphavantage.co/query?' + new URLSearchParams({ 
            function: 'TIME_SERIES_INTRADAY', 
            symbol: symbol, 
            interval: '5min', 
            apikey: STOCK_API_KEY
        }))
    
        data = (await response.json())['Time Series (5min)']
    }
    console.log('data received')
    // todo -- transform data to format... {date, fin5}
    // object of objects with keys which are datetime strings
    // for (const [datetime, f] of Object.entries(data)) {
        // TODO need datetime tool?
        // const [date, time] = datetimeKey.split(' ') // example '2024-10-28 19:55:00'
        // { "dt": {open,h,l,c,v} }
        
        
        // n.push({
        //     datetime,
        //     open: f["1. open"],
        //     high: f["2. high"],
        //     low: f["3. low"],
        //     close: f["4. close"],
        //     volume: f["5. volume"],
        // })
        
    // }

    return data
  }

  async function queryStock(stockSymbol) {
    const data = await getStock(stockSymbol);
    console.log(data)

  }

  // set up client event listeners:
  thisClient.on("message", clientResponse);
  thisClient.on("close", endClient);
  
}

// start the server:
server.listen(process.env.PORT || 433, serverStart);
// start the websocket server listening for clients:
wss.on("connection", handleClient);