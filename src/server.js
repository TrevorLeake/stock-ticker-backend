const fs = require('fs');
const express = require('express');
const fetch = require('node-fetch');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const { URLSearchParams } = require('url');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const clients = []


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


function serverStart() {
  var port = this.address().port;
  console.log("Stock websocket server listening on port " + port);
}

server.listen(433, serverStart);
wss.on("connection", handleClient);