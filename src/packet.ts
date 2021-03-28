/**
 * Abstract data structure containing the opcode and parameters.
 */
export class Packet {
    /**
     * Opcode, determines which command the game should interpret.
     * See: https://github.zhaw.ch/raycasters/docs/wiki/Protocol#opcode
     */
    private opcode: number;

    /**
     * Parameter. Will be parsed by the game logic. Can be an empty string.
     */
    private parameter: string;

    /**
     * Creates a new Packet.
     * @param message Message from server.
     */
    constructor(message: string) {
        // TODO: Parse the message from the server using our Protocol Parser (@baggoe)
        this.opcode = 1;
        this.parameter = message;
    }

    /**
     * Prepares data to be sent to server. 
     */
    public serialize() {
        return this.opcode.toString() + " " + this.parameter;
    }
}