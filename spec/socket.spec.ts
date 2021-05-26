import { WebSocket } from './websocketmock'
import { Socket, SocketState } from '../src/communication/socket'
import { Packet } from '../src/communication/packet'
import { ProtocolParser } from '../src/communication/protocolparser';
import { OpCode } from '../src/communication/opcode';
import { GameHUD } from './gamehudmock';

const url = "ws://fakeurl.ch";
const HUDmock = new GameHUD();
const webSocket = new WebSocket(url);
const testSocket = new Socket(url, HUDmock, webSocket );
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
    let innerSocket = new Socket(url, HUDmock, innerWebSocket);

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
    let innerSocket = new Socket(url, HUDmock, innerWebSocket);

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

  it('should recognize the socket ready state', () => {
    let innerWebSocket = new WebSocket(url);
    let innerSocket = new Socket(url, HUDmock, innerWebSocket);
    innerWebSocket.readyState = 1;

    // Prepare SERVER_DISCONNECT message (1-byte array with content 0x64)
    let message: Uint8Array = new Uint8Array(new ArrayBuffer(1));
    message.set([0x64]);

    // Receive data from Socket
    innerWebSocket.triggerOnMessage(message);
    expect(innerSocket.socketState).toBe(SocketState.CLOSED);
    expect(innerSocket.getReceived()[0]).toBeUndefined;
    // TODO: Get this test to work correctly
  })

  it('should handle undefined messages correctly', () => {
    // Prepare new WebSocket and Socket
    let innerWebSocket = new WebSocket(url);
    let innerSocket = new Socket(url, HUDmock, innerWebSocket);

    // Prepare SERVER_DISCONNECT message (1-byte array with content 0x64)
    let message: any = undefined;

    // Receive data from Socket
    innerWebSocket.triggerOnMessage(message);
    expect(innerSocket.getReceived()[0]).toBeUndefined;
  })
});