import { Packet } from "../communication/packet";
import { Socket, SocketState } from "../communication/socket";

export class GameLoop {
  private lastTime: number;
  private callback: any;
  private secSum: number;
  private frameSum: number;
  private fpsElem: HTMLElement;
  private socket: Socket;

  /**
   * FPS goal ideally met. If below, resolution gets toned down. By resolution we mean bar subdivision of walls rendered on-screen.
   */
  private static readonly FPS_GOAL: number = 50;
  
  /**
   * Minimum FPS threshold. If the framerate dips below that, dynamic resolution iteration gets triggered.
   */
  private static readonly FPS_MINIMUM: number = 30;

  /**
   * Counts of dynamic resolution.
   */
  private resolutionAdjustCounter: number;

  /**
   * Maximum amount of resolution iteration steps and seconds until an ideal resolution was found.
   */
  private static readonly MAXIMUM_RESOLUTION_ADJUST = 10;

  /**
   * How aggressive the dynamic resolution iteration is. Ideally between 5 and 20.
   */
  private static readonly DYNAMIC_RESOLUTION_AGGRESSIVENESS = 10;

  /**
   * Callback to resolution change method located in the Renderer class.
   */
  private changeResolutionCallback: any;


  constructor(fpsDivName: string, changeResolutionCallback: any) {
    this.frame.bind(this);
    this.lastTime = 0;
    this.secSum = 0;
    this.frameSum = 0; 
    this.fpsElem = document.getElementById(fpsDivName);
    this.socket = new Socket("ws://127.0.0.1:8080/ws/1"); // TODO: Change to our server address.
    this.changeResolutionCallback = changeResolutionCallback;
  }

  public begin(callb: any): void {
    this.callback = callb;
    requestAnimationFrame(this.frame);
  }

  /**
   * Triggers dynamic resolution negotiation between game and browser / machine.
   */
  private dynamicResolution(){
    this.changeResolutionCallback(((this.frameSum <= GameLoop.FPS_GOAL) ? - 1 : 1 ) * GameLoop.DYNAMIC_RESOLUTION_AGGRESSIVENESS);
    this.resolutionAdjustCounter++;
  }

  /**
   * Restart dynamic resolution negotiation.
   */
  public restartDynamicResolution(){
    this.resolutionAdjustCounter = 0;
  }

  /**
   * Handling of each frame.
   * @param currTime Current time.
   */
  public frame = (currTime: number) => {
    // How many seconds have passed, is probably a small fraction:
    let secs = (currTime - this.lastTime) / 1E3;

    this.secSum += secs;
    ++this.frameSum;

    if (this.secSum >= 1) {
      if (this.frameSum < GameLoop.FPS_MINIMUM) {
        this.restartDynamicResolution();
      }

      this.fpsElem.innerText = `${this.frameSum}`;
      this.secSum = 0;

      if (this.resolutionAdjustCounter < GameLoop.MAXIMUM_RESOLUTION_ADJUST) {
        this.dynamicResolution();
      }

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

  
  public get getSocketState() : SocketState {
    return this.socket.socketState;
  }
  
}
