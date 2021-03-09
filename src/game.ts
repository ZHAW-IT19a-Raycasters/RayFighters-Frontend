import * as example from './example_module';
// can also import npm stuff here btw

let node = document.createElement("LI");
let textnode = document.createTextNode(example.hi('chad'));
node.appendChild(textnode);
document.body.appendChild(node);
