import { WebSocket } from './websocketmock'
import { Socket, SocketState } from '../src/socket'
import { OpCode, Packet } from '../src/packet'
import { ProtocolParser } from '../src/protocolparser';

const url = "ws://fakeurl.ch";
const webSocket = new WebSocket(url);
const testSocket = new Socket(url, webSocket);
const testPacket = new Packet({ opCode: OpCode.CLIENT_DISCONNECT });
const expectedContent = new Uint8Array([OpCode.CLIENT_DISCONNECT]);

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
    // Prepare new WebSocket and Socket
    let innerWebSocket = new WebSocket(url);
    let innerSocket = new Socket(url, innerWebSocket);

    // Set up Socket
    innerWebSocket.triggerOnOpen();
    innerSocket.send(testPacket);
    innerSocket.sendAll();

    // Check for status
    expect(innerSocket.socketState).toBe(SocketState.CONNECTED);
    expect(innerSocket.socketState).not.toBe(SocketState.ERROR);

    // Extract message from WebSocket
    let receivedData: ArrayBuffer = innerWebSocket.sendMessages.dequeue();

    // Check for defined-ness and for data to not be null
    expect(receivedData).not.toEqual(null);
    expect(receivedData).not.toBeUndefined();

    let innerExpectedContent = ProtocolParser.get.serialize(testPacket).buffer
    expect(receivedData).toEqual(innerExpectedContent);
    
  });

  it('should receive messages', () => {
    // Prepare new WebSocket and Socket
    let innerWebSocket = new WebSocket(url);
    let innerSocket = new Socket(url, innerWebSocket);

    // Define expected packet (SERVER_DISCONNECT message)
    const expectedPacket = new Packet({ opCode: OpCode.SERVER_DISCONNECT });

    // Prepare SERVER_DISCONNECT message (1-byte array with content 0x64)
    let message: Uint8Array = new Uint8Array(new ArrayBuffer(1));
    message.set([0x64]);

    // Receive data from Socket
    innerWebSocket.triggerOnMessage(message);
    let receivedData: Packet = innerSocket.getReceived()[0];

    // Check for data to be defined and to not be null
    expect(receivedData).not.toEqual(null);
    expect(receivedData).not.toBeUndefined();

    // Trigger socket to send back a message
    expect(receivedData.opCode).toEqual(expectedPacket.opCode);
  })
});