import { WebSocket } from './websocketmock'
import { Socket, SocketState } from '../src/socket'
import { Packet } from '../src/packet'

let url = "ws://fakeurl.ch";
let testMessage1 = "test";
let testMessage2 = "anothertest";
let webSocket = new WebSocket(url);
let testSocket = new Socket(url, webSocket);
let testPacket1 = new Packet(testMessage1);
let testPacket2 = new Packet(testMessage2);


describe('Player module testing', () => {

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

    it('should send and receive multiple messages', () => {
      testSocket.send(testPacket1);
      testSocket.send(testPacket2);
      testSocket.sendAll();
      let receivedPacket = testSocket.getReceived();

      expect(receivedPacket[0].serialize()).toBe("1 1 " + testMessage1);
      expect(receivedPacket[0].getOpcode).toBe(1);
      expect(receivedPacket[0].getParameter).toBe("1 " + testMessage1);

      expect(receivedPacket[1].serialize()).toBe("1 1 " + testMessage2);
      expect(receivedPacket[1].getOpcode).toBe(1);
      expect(receivedPacket[1].getParameter).toBe("1 " + testMessage2);
    });
});