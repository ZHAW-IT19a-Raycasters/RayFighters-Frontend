/**
 * Mock for Javascript 2D Canvas.
 */
export class Canvas {
    private context = new Context();
    public getContext(): Context {
        return this.context;
    }
}

/**
 * Mocked context class.
 * Also provides methods to check if the rendering engine does its job correctly.
 */
class Context {
    public drawImageCount: number = 0;
    public drawGradientCount: number = 0;
    public saveCount: number = 0;
    public restoreCount: number = 0;

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
    public drawImage() { this.drawImageCount++; }
    public save() { this.saveCount++; }
    public fillText() { /* No implementation */ }
    public restore() { this.restoreCount++; }
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
    public createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
        this.drawGradientCount++;
        return new MockGradient();
    }
}

/**
 * Mocked Gradient class.
 */
class MockGradient {
    public addColorStop(arg1: number, arg2: string) { /* No implementation */ }
}