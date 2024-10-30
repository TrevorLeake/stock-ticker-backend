
var express = require('express');


const {createServer} = require("http");
const {WebSocketServer} = require("ws");

var app = express();

// Start the server
app.listen(8080, () => {
    console.log(`Websocket server listening on port 8080`);
});


var wsServer = new WebSocketServer({
    httpServer: app
});

var connections = [];
var numbers = [];

wsServer.on('request', (request) => {
    var connection = request.accept(request.origin);
    connections.push(connection);
    console.log(connection.remoteAddress + " connected - Protocol Version " + connection.webSocketVersion);
    
    // Send all the existing canvas commands to the new client
    connection.sendUTF(JSON.stringify({
        msg: "initCommands",
        data: numbers
    }));
    
    // Handle closed connections
    connection.on('close', function() {
        console.log(connection.remoteAddress + " disconnected");
        
        var index = connections.indexOf(connection);
        if (index !== -1) {
            // remove the connection from the pool
            connections.splice(index, 1);
        }
    });
    
    // Handle incoming messages
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            try {
                var command = JSON.parse(message.utf8Data);
                
                console.log('received: ', command)
                if (command.msg === 'clear') {
                    canvasCommands = [];
                }
                else {
                    canvasCommands.push(command);
                }

                // rebroadcast command to all clients
                connections.forEach(function(destination) {
                    destination.sendUTF(message.utf8Data);
                });
            }
            catch(e) {
                // do nothing if there's an error.
            }
        }
    });
});
