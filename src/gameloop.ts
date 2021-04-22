import { Packet } from "./communication/packet";
import { Socket } from "./communication/socket";
import { Renderer } from "./rendering/renderer";

export class GameLoop {
  private lastTime: number;
  private callback: any;
  private secSum: number;
  private frameSum: number;
  private fpsElem: HTMLElement;
  private socket: Socket;
  private static readonly FPS_GOAL: number = 60;
  private renderer: Renderer;


  constructor(fpsDivName: string, renderer: Renderer) {
    this.frame.bind(this);
    this.lastTime = 0;
    this.secSum = 0;
    this.frameSum = 0;
    this.fpsElem = document.getElementById(fpsDivName);
    this.socket = new Socket("ws://localhost:8080"); // TODO: Change to our server address.
    this.renderer = renderer;
  }

  public begin(callb: any): void {
    this.callback = callb;
    requestAnimationFrame(this.frame);
  }

  public frame = (currTime: number) => {
    // How many seconds have passed, is probably a small fraction:
    let secs = (currTime - this.lastTime) / 1E3;

    this.secSum += secs;
    ++this.frameSum;

    if(this.frameSum <= GameLoop.FPS_GOAL) {
      this.renderer.changeResolution(0.25); 
    } else {
      this.renderer.changeResolution(-0.25);
    }

    if (this.secSum >= 1) {
      this.fpsElem.innerText = `${this.frameSum}`;
      this.secSum = 0;
      this.frameSum = 0;
    }

    this.lastTime = currTime;

    /**
     * Example code for error handling. 
     * TODO: implement error handling.
     * Socket states can only be polled, the game isn't notified if something goes wrong.
    
    if (this.socket.socketState === SocketState.CLOSED) {
      alert('Connection is closed!')
    }

    if (this.socket.socketState === SocketState.ERROR) {
      alert('Connection error!')
    }
    */

    if (secs <= 1) {
      var that = this;
      this.callback(secs, this.socket.getReceived(), function (packet: Packet) { that.socket.send(packet) });
    }
    requestAnimationFrame(this.frame);

    this.socket.sendAll();
  }
}
