import { Controls, KeyCodes } from "../src/player/controls";
import { JSDOM } from 'jsdom';
import * as fs from 'fs'

// JSDOM Setup
const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document, KeyboardEvent, navigator } = (new JSDOM(index)).window;
global.document = document;

// Variables
let c: Controls;


describe('Controls methods', () => {
    it('should clear inputs from the states map', () => {
        // Setup
        c = new Controls(navigator);

        // Test
        c.states.set(KeyCodes.SHOOT, true)
        c.clearInputs();

        // Verification
        expect(c.states.get(KeyCodes.SHOOT) == false);
    });

    it('should register a keydown event', () => {
        // Setup
        c = new Controls(navigator);

        [KeyCodes.BACKWARD, KeyCodes.FORWARD, KeyCodes.SCOREBOARD, KeyCodes.SHOOT, KeyCodes.STRAFE_LEFT, KeyCodes.STRAFE_RIGHT, KeyCodes.TURN_LEFT, KeyCodes.TURN_RIGHT].forEach(element => {
            // Test
            document.dispatchEvent(new KeyboardEvent('keydown', { code: element.toString() }));
            
            // Verification
            expect(c.states.get(element) == true);
        });
    });
});
