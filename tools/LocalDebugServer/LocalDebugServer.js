/**
 * Emulates a server on your machine.
 * 
 * To use type on your terminal:        node LocalDebugServer.js
 * The default address and port is:     ws://localhost:8080
 * 
 * Code example:
 * this.socket = new Socket("ws://localhost:8080"); // TODO: Change to our server address.
 */

const WebSocket = require('ws')
 
const wss = new WebSocket.Server({ port: 8080 })
console.log("Starting server on port 8080... Listening now!")

const testMessage = new Uint8Array([0x65]) // Opcode.SERVER_UNKNOWN

let buffer = new ArrayBuffer(1)
buffer = testMessage.buffer


let counter = 0
 
wss.on('connection', ws => {
    console.log("Connection established with game client!")

    // Receive message
    ws.on('message', (message) => {

        let printMessage = "";
        for (let index = 0; index < message.length; index++) {
            printMessage += message[index].toString(16);
            printMessage += " "
        }
    console.log("Message received! " + printMessage + " ||| # of received messages: " + counter++)
        //for each websocket client
        wss
        .clients
        .forEach( client => {
            //send the client the current message
            //client.send(buffer);
        });
    });

  ws.send(buffer)
})



