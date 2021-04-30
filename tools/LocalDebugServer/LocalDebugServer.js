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

    // Send 'You are called'
    buffer = new Uint8Array([0x7C, 0xAA]);
    ws.send(buffer)

    // Send teleport
    //buffer = new Uint8Array([0x6F, 0xAA, 0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0xB9, 0x3F, 0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0xC9, 0x3F]);
    //ws.send(buffer)

    // Send player info
    buffer = new Uint8Array([0x82, 0x3, 0x1, 0x4, 0x0, 0x48, 0x61, 0x6E, 0x73, 0x4, 0x5, 0x0, 0x50, 0x65, 0x74, 0x65, 0x72, 0x34, 0x5, 0x0, 0x4D, 0x65, 0x69, 0x65, 0x72]);
    ws.send(buffer)

    // Send player KD
    buffer = new Uint8Array([0x83, 0x3, 0x1, 0xB, 0x0, 0xC, 0x0, 0x4, 0xC, 0x0, 0xD, 0x0, 0x34, 0x42, 0x0, 0x65, 0x0]);
    ws.send(buffer)

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

  
})



