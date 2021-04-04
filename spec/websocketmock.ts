export class WebSocket{
    public onopen: any;
    public onmessage: any;
    public onclose: any;
    public onerror: any;
    public readyState: number = 1;
    
    constructor(url: string) {
        // deliberately empty
    }

    public send(message: string) {
        this.triggerOnMessage(message);
    }

    public triggerOnMessage(message: string) {
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