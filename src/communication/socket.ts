import { Queue } from 'queue-typescript';
import { LogicHelper } from '../logic/logichelper';
import { GameHUD } from '../ui/gameHud';
import { Packet } from './packet';
import { ProtocolParser } from './protocolparser';

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

    private gameHUD: GameHUD;

    /**
     * Creates a new socket connection.
     * @param url Server address
     */
    constructor(url: string, gameHUD: any, webSocket?: any) {
        this.sendQueue = new Queue<Packet>();
        this.receiveQueue = new Queue<Packet>();
        
        if (webSocket) {
            this.socket = webSocket;
        } else {
            this.socket = new WebSocket(url);
        }

        this.gameHUD = gameHUD;

        this.socket.binaryType = "arraybuffer";
        
        this.socket.onopen = (e) => {
            this.gameHUD.showSocketStatus("Connection established.");
            this.socketState = SocketState.CONNECTED;
        };

        this.socket.onmessage = async (e) => {
            let messageBuffer: ArrayBuffer = e.data;
            if (messageBuffer == undefined) {
                return;
            }
            let messageArray = new Uint8Array(messageBuffer);
            this.receiveQueue.enqueue(ProtocolParser.get.parse(messageArray));
        };

        this.socket.onclose = (e) => {
            // TODO: change to showAlert()
            this.gameHUD.showSocketStatus("Connection from server closed.");
            this.socketState = SocketState.CLOSED;
            LogicHelper.exitGame();
        };
        
        this.socket.onerror = (e) => {
            // TODO: change to showAlert()
            this.gameHUD.showSocketStatus("ERROR! Connection couldn't be established.");
            this.socketState = SocketState.ERROR;
            LogicHelper.exitGame();
        };
    }

    /**
     * Check if socket is ready
     * @returns true if ready
     */
    private readyCheck(): boolean {
        if (this.socket.readyState !== 1) {
            this.socketState = SocketState.ERROR;
            return false;
        }
        return true;
    }

    /**
     * Enqueues a Packet to be sent to the server.
     * @param packet Packet to be sent to the server.
     */
    public send(packet: Packet): void {
        if (!this.readyCheck()){
            return;
        }
        this.sendQueue.enqueue(packet);
    }

    /**
     * Sends all enqueued Packets heading to the server.
     */
    public sendAll() {
        if (!this.readyCheck()){
            return;
        }
        // Sending messages as long as sendQueue isn't empty
        while (this.sendQueue.length > 0) {
            let serializedData: ArrayBuffer = ProtocolParser.get.serialize(this.sendQueue.dequeue()).buffer;
            this.socket.send(serializedData);
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
