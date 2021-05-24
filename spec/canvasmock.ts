export class Canvas {
    private context = new Context();
    public getContext(): Context {
        return this.context;
    }
}

class Context {
    public fillRect() { /* No implementation */ }
    public clearRect() { /* No implementation */ }
    public getImageData(x: any, y: any, w: number, h: number) {
        return {
            data: new Array(w * h * 4)
        }
    }
    public putImageData() { /* No implementation */ }
    public createImageData(): any[] { return [] }
    public setTransform() { /* No implementation */ }
    public drawImage() { /* No implementation */ }
    public save() { /* No implementation */ }
    public fillText() { /* No implementation */ }
    public restore() { /* No implementation */ }
    public beginPath() { /* No implementation */ }
    public moveTo() { /* No implementation */ }
    public lineTo() { /* No implementation */ }
    public closePath() { /* No implementation */ }
    public stroke() { /* No implementation */ }
    public translate() { /* No implementation */ }
    public scale() { /* No implementation */ }
    public rotate() { /* No implementation */ }
    public arc() { /* No implementation */ }
    public fill() { /* No implementation */ }
}