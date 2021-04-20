import { Queue } from "queue-typescript";

export class WebSocket{
    public onopen: any;
    public onmessage: any;
    public onclose: any;
    public onerror: any;
    public readyState: number = 1;
    public sendMessages: Queue<ArrayBuffer> = new Queue<ArrayBuffer>();
    public binaryType: string;

    constructor(url: string) {
        // deliberately empty
    }

    public send(message: ArrayBuffer) {
        this.sendMessages.enqueue(message);
    }

    public triggerOnMessage(message: ArrayBuffer) {
        this.onmessage({ data: message });
    }

    public triggerOnClose() {
        this.onclose();
    }

    public triggerOnError() {
        this.onerror();
    }

    public triggerOnOpen() {
        this.onopen();
    }

}