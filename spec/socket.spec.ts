import { WebSocket } from './websocketmock'
import { Socket, SocketState } from '../src/socket'
import { OpCode, Packet } from '../src/packet'
import { ProtocolParser } from '../src/protocolparser';
var Blob = require('blob');


const url = "ws://fakeurl.ch";
const webSocket = new WebSocket(url);
const testSocket = new Socket(url, webSocket);
const testPacket = new Packet({ opCode: OpCode.SERVER_DISCONNECT });
const expectedContent = new Uint8Array([OpCode.SERVER_DISCONNECT]);

describe('Socket method testing', () => {

  it('should recognize a closed connection.', () => {
    webSocket.triggerOnClose();
    expect(testSocket.socketState).toBe(SocketState.CLOSED);
  });

  it('should recognize an open connection.', () => {
    webSocket.triggerOnOpen();
    expect(testSocket.socketState).toBe(SocketState.CONNECTED);
  });

  it('should recognize a connection with an error.', () => {
    webSocket.triggerOnError();
    expect(testSocket.socketState).toBe(SocketState.ERROR);
  });

  it('should send messages', () => {
    let innerWebSocket = new WebSocket(url);
    let innerSocket = new Socket(url, innerWebSocket);

    innerWebSocket.triggerOnOpen();
    innerSocket.send(testPacket);
    innerSocket.sendAll();

    expect(innerSocket.socketState).toBe(SocketState.CONNECTED);
    expect(innerSocket.socketState).not.toBe(SocketState.ERROR);

    let receivedData: Blob = innerWebSocket.sendMessages.dequeue();

    expect(receivedData).not.toEqual(null);
    expect(receivedData).not.toBeUndefined();

    let innerExpectedContent = new Blob([ProtocolParser.get.serialize(testPacket)])
    expect(receivedData).toBe(innerExpectedContent);
  });

  it('should receive messages', () => {
    //let receivedPacket = testSocket.getReceived();
    //let receivedData = ProtocolParser.get.serialize(receivedPacket);

  })
});