import { WebSocket } from "../../spec/websocketmock";
import { Packet } from "../communication/packet";
import { Socket, SocketState } from "../communication/socket";
import { GameHUD } from "../ui/gameHud";

export class GameLoop {
  /**
   * Last frame time in seconds
   */
  private lastTime: number;

  /**
   * Function callback that implements what happens each frame
   * function(time, packetArray, sendCallback)
   */
  private callback: any;
  
  /**
   * Timer sum to eventually check if a second has passed.
   */
  private secSum: number;

  /**
   * Counter to keep track of how many frames we achieved in the last second.
   */
  private frameSum: number;

  /**
   * Where we .innerText put how much FPS we achieved
   */
  private fpsElem: HTMLElement;

  /**
   * For server communication
   */
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
   * Maximum amount of resolution iteration steps and seconds until an ideal resolution was found.
   */
  private static readonly MAXIMUM_RESOLUTION_ADJUST = 10;

  /**
   * How aggressive the dynamic resolution iteration is. Ideally between 5 and 20.
   * The higher, the faster the resolution gets turned.
   */
  private static readonly DYNAMIC_RESOLUTION_AGGRESSIVENESS = 10;

  /**
   * Counts of dynamic resolution.
   */
  private resolutionAdjustCounter: number;

  /**
   * Callback to resolution change method located in the Renderer class.
   * Has form function(deltaResolution), so by how much we change the resolution.
   */
  private changeResolutionCallback: any;

  /**
   * A reference to the gamehud
   */
  private gameHudReference: GameHUD;

  /**
   * Constructs a new game loop.
   * @param websocketServerUrl URL of the {@link WebSocket}
   * @param fpsDivName HTML ID as string where we put how much FPS we got
   * @param changeResolutionCallback Callback function ({@link deltaResolution}) to change the raycaster resolution
   * @param gameHUD {@link GameHUD} instance.
   * @param windowMock Mocked {@link window} instance for tests.
   */
  constructor(websocketServerUrl: string, fpsDivName: string, changeResolutionCallback: any, gameHUD: GameHUD, windowMock?: any) {
    this.frame.bind(this);
    this.lastTime = 0;
    this.secSum = 0;
    this.frameSum = 0;
    this.fpsElem = document.getElementById(fpsDivName);

    // Check if test or running in production environment.
    if (windowMock) {
      // Set up a partially mocked socket
      this.socket = new Socket(websocketServerUrl, gameHUD, WebSocket);
    } else {
      // Set up a real socket
      if (window.location.host === 'localhost:9000' || window.location.host === '127.0.0.1:9000') {
        this.socket = new Socket(websocketServerUrl, gameHUD);
      } else {
        this.socket = new Socket("ws://" + window.location.host + "/server/ws/1", gameHUD);
      }
    }
    this.changeResolutionCallback = changeResolutionCallback;
    this.gameHudReference = gameHUD;
  }

  /**
   * Set callback function that gets called each frame.
   * @param callb Callback function(time, packetArray, sendCallback)
   */
  public begin(callb: any): void {
    this.callback = callb;

    // Check if running in browser or node. Needed for testing.
    if (typeof process === 'undefined') {
      requestAnimationFrame(this.frame);
    }
  }

  /**
   * Triggers dynamic resolution negotiation between game and browser / machine.
   */
  private dynamicResolution(): void {
    this.changeResolutionCallback(((this.frameSum <= GameLoop.FPS_GOAL) ? - 1 : 1) * GameLoop.DYNAMIC_RESOLUTION_AGGRESSIVENESS);
    this.resolutionAdjustCounter++;
  }

  /**
   * Restart dynamic resolution negotiation.
   */
  public restartDynamicResolution(): void {
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

    // One second has passed:
    if (this.secSum >= 1) {
      if (this.frameSum < GameLoop.FPS_MINIMUM) {
        this.restartDynamicResolution();
      }

      // Update round timer:
      this.gameHudReference.updateTimer();

      this.fpsElem.innerText = `${this.frameSum}`;
      this.secSum = 0;

      if (this.resolutionAdjustCounter < GameLoop.MAXIMUM_RESOLUTION_ADJUST) {
        this.dynamicResolution();
      }

      this.frameSum = 0;
    }

    this.lastTime = currTime;

    if (secs <= 1) {
      var that = this;
      this.callback(secs, this.socket.getReceived(), function (packet: Packet) { that.socket.send(packet) });
    }
    requestAnimationFrame(this.frame);

    this.socket.sendAll();
  }

  /**
   * Override {@link Socket} instance with a partially mocked one. Needed for testing.
   * @param socket Mocked {@link Socket}
   */
  public overrrideSocket(socket: Socket) {
    this.socket = socket;
  }

  public get getSocketState(): SocketState {
    return this.socket.socketState;
  }
}
