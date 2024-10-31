

const cors = require('cors')
const express = require('express')
const sqlite3 = require('sqlite3').verbose();
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const wsRoute = require('./stock-websocket.js')
const stockRoutes = require('./stock-routes.js')

const PORT = 8080

const app = express();

app.use('/stocks', stockRoutes)


const server = createServer(app);
const wss = new WebSocketServer({ server });
wss.on("connection", wsRoute);


function serverStart() {
    var port = this.address().port;
    console.log("Stock websocket server listening on port " + port);
}

server.listen(PORT, serverStart)
