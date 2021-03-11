interface FrameCallback {
  frame(time: number): void;
}

class GameLoop {
  private lastTime: number;
  private callback: any;

  constructor() {
    this.frame.bind(this);
    this.lastTime = 0; 
  }

  public begin(callb: any): void {
    this.callback = callb;
    requestAnimationFrame(this.frame);
  }

  public frame = (currTime: number) => {
    // How many seconds have passed, is probably a small fraction:
    let secs = (currTime - this.lastTime) / 1E3;
    this.lastTime = currTime;
    if(secs <= 1) {
      this.callback(secs);
    }
    requestAnimationFrame(this.frame);
  }
}

export { GameLoop, FrameCallback };
