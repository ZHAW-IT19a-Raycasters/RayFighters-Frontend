/**
 * SEÑOR DEBUGGERINO SERVERINO.
 * 
 * Emulates a serverino on your machino to do some debuggerino to the raycasterinos.
 * 
 * To use type on your terminal:        node LocalDebugServer.js
 * The default address and port is:     ws://localhost:8080
 * 
 * Code example:
 * this.socket = new Socket("ws://localhost:8080"); // TODO: Change to our server address.
 */

const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })
console.log("Starting debuggerino serverino on port 8080... Doing a listen and boop the snoot!")

const testMessage = new Uint8Array([0x65]) // Opcode.SERVER_UNKNOWN

let buffer = new ArrayBuffer(1)
buffer = testMessage.buffer

let testcoor = 0;

let counter = 0

wss.on('connection', ws => {
    console.log("Connection established with game client!")

    //playerInfo[0] = new PlayerInfo({ userID: 1, userName: "Hans" });
    //playerInfo[1] = new PlayerInfo({ userID: 4, userName: "Peter" });
    //playerInfo[2] = new PlayerInfo({ userID: 52, userName: "Meier" });

    // Send 'You are called'
    buffer = new Uint8Array([0x7C, 0xAA]);
    ws.send(buffer)

    // Send player info
    buffer = new Uint8Array([0x82, 0x3, 0x1, 0x4, 0x0, 0x48, 0x61, 0x6E, 0x73, 0x4, 0x5, 0x0, 0x50, 0x65, 0x74, 0x65, 0x72, 0x34, 0x5, 0x0, 0x4D, 0x65, 0x69, 0x65, 0x72]);
    ws.send(buffer)

    // Send player KD
    buffer = new Uint8Array([0x83, 0x3, 0x1, 0xB, 0x0, 0xC, 0x0, 0x4, 0xC, 0x0, 0xD, 0x0, 0x34, 0x42, 0x0, 0x65, 0x0]);
    ws.send(buffer)

    teleport(0x01, 4, 2, ws);
    teleport(0x04, 5, 6, ws);
    teleport(0x34, 3, 3, ws);

    setTimeout(function () {
        buffer = new Uint8Array([0x78, 0x45, 0xAA]);
        ws.send(buffer)
        setTimeout(function () {
            teleport(0xAA, 4, 2, ws);
        }, 1000);
    }, 10000);

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
            .forEach(client => {
                //send the client the current message
                //client.send(buffer);
            });
    });

})

function floatToU8(floatToConvert) {
    var data = new Float64Array([floatToConvert]);
    return new Uint8Array(data.buffer);
}

function teleport(uid, xpos, ypos, websock) {
    let x = floatToU8(xpos);
    let y = floatToU8(ypos);
    buffer = new Uint8Array([0x6F, uid, 0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0xB9, 0x3F, 0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0xC9, 0x3F]);
    for (let index = 0; index < 8; index++) {
        buffer[index + 2] = x[index]
        buffer[index + 10] = y[index]
    }
    websock.send(buffer);
}

function move(uid, xpos, ypos, angle, websock) {
    let x = floatToU8(xpos);
    let y = floatToU8(ypos);
    let a = floatToU8(angle);
    buffer = new Uint8Array([0x6E, uid, 0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0xB9, 0x3F, 0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0xC9, 0x3F, 0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0x1B, 0x40]);
    for (let index = 0; index < 8; index++) {
        buffer[index + 2] = x[index]
        buffer[index + 10] = y[index]
        buffer[index + 18] = a[index]
    }
    websock.send(buffer);
}



