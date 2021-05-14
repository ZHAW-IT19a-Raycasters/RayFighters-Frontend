import { JSDOM } from 'jsdom';
import * as fs from 'fs'

export class PreTest {
    constructor(){
        const index = fs.readFileSync('./dist/index.html', 'utf-8');
        const { document } = (new JSDOM(index)).window;
        global.document = document;
    }
}
