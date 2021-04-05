import { WebSocket } from './websocketmock'
import { Socket, SocketState } from '../src/socket'
import { OpCode, Packet } from '../src/packet'
import { ProtocolParser } from '../src/protocolparser';

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

  /*
  it('should send and receive messages', () => {
    testSocket.send(testPacket);
    testSocket.sendAll();
    let receivedPacket = testSocket.getReceived();
    const protocolParser = new ProtocolParser();
    let receivedData = protocolParser.serialize(receivedPacket[0]);
    expect(receivedData[0]).toBe(expectedContent[0]);
  });
  */
});