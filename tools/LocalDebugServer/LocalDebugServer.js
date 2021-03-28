/**
 * Emulates a server on your machine.
 * 
 * To use type on your terminal:        node WebSocketSpoofer.js
 * The default address and port is:     ws://localhost:8080
 * 
 * Code example:
 * this.socket = new Socket("ws://localhost:8080"); // TODO: Change to our server address.
 */

const WebSocket = require('ws')
 
const wss = new WebSocket.Server({ port: 8080 })

let counter = 0
 
wss.on('connection', ws => {
// Receive message
    ws.on('message', (message) => {
    console.log(message + " / /// counter: " + counter++)
        //for each websocket client
        wss
        .clients
        .forEach( client => {
            //send the client the current message
            client.send(`{ "Server says hewwo!" }`);
        });
    });

  ws.send('Hello! Message From Server!!')
})



