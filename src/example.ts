class Example {
  private myNum: number;

  constructor(num: number) {
    this.myNum = num
  }

  public transformNum(): void {
    this.myNum += 10;
  }

  public getNum(): number {
    return this.myNum;
  }
}

export { Example };
