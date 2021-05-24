import { Controls } from "../src/player/controls";
import { KeyCodes } from "../src/player/controls";
import { JSDOM } from 'jsdom';
import * as fs from 'fs'

const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document, KeyboardEvent, navigator } = (new JSDOM(index)).window;
global.document = document;
let c: Controls;


describe('Controls methods', () => {
    it('should clear inputs from the states map', () => {
        c = new Controls(navigator);
        c.states.set(KeyCodes.SHOOT, true)
        c.clearInputs();
        expect(c.states.get(KeyCodes.SHOOT) == false);
    });

    it('should register a keydown event', () => {
        c = new Controls(navigator);

        [KeyCodes.BACKWARD, KeyCodes.FORWARD, KeyCodes.SCOREBOARD, KeyCodes.SHOOT, KeyCodes.STRAFE_LEFT, KeyCodes.STRAFE_RIGHT, KeyCodes.TURN_LEFT, KeyCodes.TURN_RIGHT].forEach(element => {
            document.dispatchEvent(new KeyboardEvent('keydown', { code: element.toString() }));
            expect(c.states.get(element) == true);
        });
    });
});
