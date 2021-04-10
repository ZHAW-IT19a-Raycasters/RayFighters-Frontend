import { Queue } from "queue-typescript";

export class WebSocket{
    public onopen: any;
    public onmessage: any;
    public onclose: any;
    public onerror: any;
    public readyState: number = 1;
    public sendMessages: Queue<Blob> = new Queue<Blob>();

    constructor(url: string) {
        // deliberately empty
    }

    public send(message: Blob) {
        this.sendMessages.enqueue(message);
    }

    public triggerOnMessage(message: Blob) {
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