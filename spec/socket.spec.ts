import { WebSocket } from './websocketmock'
import { Socket } from '../src/socket'
import { Packet } from '../src/packet'

let url = "ws://fakeurl.ch";
let testMessage = "test";
let testSocket = new Socket(url, WebSocket);
let testPacket = new Packet(testMessage);

describe('Player module testing', () => {
    it('should send and receive a message', () => {
      testSocket.send(testPacket);
      testSocket.sendAll();
      let receivedPacket = testSocket.getReceived();
      expect(receivedPacket[0].serialize()).toBe("1 1 " + testMessage);
      expect(receivedPacket[0].getOpcode).toBe(1);
      expect(receivedPacket[0].getParameter).toBe("1 " + testMessage);
    });
});