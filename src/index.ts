import { landingpageScript } from "./landingpage";

/**
 * load the html for the StartMenu
 */
loadPage("../dist/html/startMenu.html");
landingpageScript();

/**
 * Loads Page
 * @param href Path to the HTML
 */
export function loadPage(href: string): void {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false);
    xmlhttp.send();
    document.getElementById('content').innerHTML = xmlhttp.responseText;
}