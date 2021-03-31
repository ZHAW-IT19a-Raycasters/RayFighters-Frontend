import { Queue } from 'queue-typescript';
import { Packet } from './packet';

/**
 * State of socket connection to server.
 */
export enum SocketState{
    CLOSED,
    CONNECTED,
    ERROR
    // TODO: Maybe add TIMEOUT
}

/**
 * WebSocket abstraction. Handling all communication with the server.
 */
export class Socket {
    /**
     * Websocket object.
     */
    private socket: WebSocket;

    /**
     * Queue of all received packets from the server.
     */
    private receiveQueue: Queue<Packet>;

    /**
     * Queue of all packets to be sent to the server.
     */
    private sendQueue: Queue<Packet>;

    /**
     * State of socket.
     */
    public socketState: SocketState = SocketState.CLOSED;

    /**
     * Creates a new socket connection.
     * @param url Server address
     */
    constructor(url: string, webSocket?: any) {
        this.sendQueue = new Queue<Packet>();
        this.receiveQueue = new Queue<Packet>();
        
        if (webSocket) {
            this.socket = webSocket;
        } else {
            this.socket = new WebSocket(url);
        }
        
        this.socket.onopen = (e) => {
            console.log("Connection established.");
            this.socketState = SocketState.CONNECTED;
        };
        this.socket.onmessage = (e) => {
            this.receiveQueue.enqueue(new Packet(e.data));
        };
        this.socket.onclose = (e) => {
            console.log("Connection from server closed.");
            this.socketState = SocketState.CLOSED;
        };
        this.socket.onerror = (e) => {
            console.log("ERROR! Connection couldn't be established.");
            this.socketState = SocketState.ERROR;
        };
    }

    /**
     * Enqueues a Packet to be sent to the server.
     * @param packet Packet to be sent to the server.
     */
    public send(packet: Packet): void {
        if (this.socket.readyState == 1) {
            this.sendQueue.enqueue(packet);
        }
    }

    /**
     * Sends all enqueued Packets heading to the server.
     */
    public sendAll() {
        // Check if socket is ready
        if (this.socket.readyState == 1) {
            // Sending messages as long as sendQueue isn't empty
            while (this.sendQueue.length > 0) {
                this.socket.send(this.sendQueue.dequeue().serialize());
            }
        }
    }

    /**
     * Returns all Packets received from the server, waiting to be incorporated into game logic.
     * @returns Array of received packets.
     */
    public getReceived(): Array<Packet> {
        let receivedPackets = new Array<Packet>(this.receiveQueue.length);
        for (let i = 0; this.receiveQueue.length > 0; i++) {
            receivedPackets[i] = this.receiveQueue.dequeue();
        }
        return receivedPackets;
    }
}
