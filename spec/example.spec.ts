import { Example } from "../src/example";

describe('Example module testing', () => {
  it('should add 10 to a number', () => {
    let e: Example = new Example(5);
    e.transformNum(); // 5 += 10 = 15 (!)
    expect(e.getNum()).toBe(15);
  });
});
