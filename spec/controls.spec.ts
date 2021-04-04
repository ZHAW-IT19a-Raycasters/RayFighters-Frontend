import { Controls } from "../src/controls";
import { KeyCodes } from "../src/controls";
import { JSDOM } from 'jsdom';
import * as fs from 'fs'

const index = fs.readFileSync('./dist/index.html', 'utf-8');
const { document, KeyboardEvent, TouchEvent } = (new JSDOM(index)).window;
global.document = document;
let c: Controls;

const mockInnerWidth: number = 1000;
const mockInnerHeight: number = 500;


describe('Controls methods', () => {
    it('should clear inputs from the states map', () => {
        c = new Controls();
        c.states.set(KeyCodes.SHOOT, true)
        c.clearInputs();
        expect(c.states.get(KeyCodes.SHOOT) == false);
    });

    it('should register a keydown event', () => {
        c = new Controls();

        [KeyCodes.BACKWARD, KeyCodes.FORWARD, KeyCodes.SCOREBOARD, KeyCodes.SHOOT, KeyCodes.STRAFE_LEFT, KeyCodes.STRAFE_RIGHT, KeyCodes.TURN_LEFT, KeyCodes.TURN_RIGHT].forEach(element => {
            document.dispatchEvent(new KeyboardEvent('keydown', { code: element.toString() }));
            expect(c.states.get(element) == true);
        });
    });

    /** 
     * TODO TouchEvent is experimental code. It may be impossible to create a test for it. This is our best effort:
     * 
    it('should register a touch event', () => {
        c = new Controls();
        [KeyCodes.BACKWARD, KeyCodes.FORWARD, KeyCodes.SCOREBOARD, KeyCodes.SHOOT].forEach(element => {
            document.dispatchEvent(new TouchEvent('touchstart', { 
                touches: 
                [new Touch({ 
                    pageX: 250, 
                    pageY: 250, 
                    identifier: 0, 
                    target: document })] 
                }));
            expect(c.states.get(element) == true);
        });
    });
    */

});
