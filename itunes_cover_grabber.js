// ==UserScript==
// @include     /^https?://itunes\.apple\.com/\w\w/album/.+/.+$/
// @description Add a link to url of album cover image
// @name        itunes_cover_grabber.js
// @run-at      document-idle
// @version     0.0.6
// ==/UserScript==

/**
 * author: jay.somedon@outlook.com
 *
 * html page for albums on itunes store are structured like this(may change in future):
 * <picture>
 *   <source media="smaller_width">
 *   <source media="smaller_width">
 *   <source media="max_width"
 *     srcset="
 *             url1 1x,
 *             url2 2x,
 *             urlmax maxx  <--- this urlmax is url to album cover with the largest resolution
 *     ">
 * this code will parse that url out and add a link to the cover url in caption area
 * so you will see a link of text "cover!!!!!" under album picture, like this:
 *       ------------------------
 *       |                      |
 *       |                      |
 *       |                      |      <---- album cover picture you typically see on left on the album page
 *       |                      |
 *       |                      |
 *       ------------------------
 *                       cover!!!!!!   <------ link to the actual image, click for view or download!!!
 *
 * for now this script is supposed to be used as a userscript, on itunes album page only.
 *
 */

function picture() {
    return document.querySelectorAll("picture.we-artwork.product-artwork--captioned")[0];
}

function sources(picture) {
    return Array.from(picture.children).filter(elem => elem.tagName == "SOURCE").filter(elem => elem.hasAttribute("media"));
}

function source_of_max_width(sources) {
    var width = function (source) {
        var reg = /\d+/;
        return parseInt(source.media.match(reg));
    }
    var greater_width = function (acc, cur) {
        return (width(acc) > width(cur)) ? acc : cur;
    }
    return sources.reduce(greater_width);
}

function cover_url(source) {
    var url_zoom_pairs = source.srcset.split(',').map(url => url.split(' '));
    var greater_url_zoom_pair = function (acc, cur) {
        return acc[1] > cur[1] ? acc : cur;
    }
    return url_zoom_pairs.reduce(greater_url_zoom_pair)[0];
}

function button_to_cover() {
    var button = document.createElement("button");
    button.onclick = function () {
        window.open(cover_url(source_of_max_width(sources(picture()))));
    };
    return button;
}

function style_button(button) {
    button.textContent = "click for cover";
    button.style.cssText = "position: fixed; margin: 3px; bottom: 0; left: 0; z-index: 99999; background-color: darkcyan; color: lightyellow; width: 100px; height: 100px; border-radius: 50px; font-size: 20px; text-align: center;";
    button.onmouseover = function () {
        this.style.background = "salmon";
    }
    button.onmouseout = function () {
        this.style.background = "darkcyan";
    }
    return button;
}

function main() {
    document.body.appendChild(style_button(button_to_cover()));
}

main();
