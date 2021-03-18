import { Controls } from "../src/controls";
import { KeyCodes } from "../src/keycodes";
import {JSDOM} from 'jsdom';
import * as fs from 'fs'

const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document } = (new JSDOM(index)).window;
global.document = document;


describe('Clear user inputs', () => {
    it('should clear inputs from the states map', () => {
        let c = new Controls();
        c.states.set(KeyCodes.SHOOT, true)
        c.clearInputs();
        expect(c.states.get(KeyCodes.SHOOT) == false);
    });
});
