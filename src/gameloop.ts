export class GameLoop {
  private lastTime: number;
  private callback: any;
  private secSum: number;
  private frameSum: number;
  private fpsElem: HTMLElement;

  constructor(fpsDivName: string) {
    this.frame.bind(this);
    this.lastTime = 0; 
    this.secSum = 0;
    this.frameSum = 0;
    this.fpsElem = document.getElementById(fpsDivName);
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

    if(this.secSum >= 1) {
      this.fpsElem.innerText = `${this.frameSum}`;
      this.secSum = 0;
      this.frameSum = 0;
    }

    this.lastTime = currTime;
    if(secs <= 1) {
      this.callback(secs);
    }
    requestAnimationFrame(this.frame);
  }
}
