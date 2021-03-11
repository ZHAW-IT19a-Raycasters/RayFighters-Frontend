/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/camera.ts":
/*!***********************!*\
  !*** ./src/camera.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Camera\": () => (/* binding */ Camera)\n/* harmony export */ });\nvar Camera = /** @class */ (function () {\n    /**\n      * @constructor\n      * @param {DOM} canv - Canvas element to draw game in\n      * @param {number} res - Resolution to render the game in (pixels). Canvas sizes may differ.\n      * @param {number} focal - focal length of our viewport, the field of view.\n      */\n    function Camera(canv, res, focal) {\n        this.canvas = canv;\n        this.ctx = canv.getContext('2d');\n    }\n    Camera.prototype.render = function () {\n        this.ctx.save();\n        this.ctx.fillRect(20, 20, 300, 100);\n        this.ctx.restore();\n    };\n    return Camera;\n}());\n\n\n\n//# sourceURL=webpack://raycaster-game/./src/camera.ts?");

/***/ }),

/***/ "./src/game.ts":
/*!*********************!*\
  !*** ./src/game.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _gameloop__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameloop */ \"./src/gameloop.ts\");\n/* harmony import */ var _camera__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./camera */ \"./src/camera.ts\");\n\n\nfunction runGame(canvasName) {\n    // The element that contains the \n    var canvas = document.getElementById(canvasName);\n    var camera = new _camera__WEBPACK_IMPORTED_MODULE_1__.Camera(canvas, 320, 0.8);\n    var loop = new _gameloop__WEBPACK_IMPORTED_MODULE_0__.GameLoop();\n    loop.begin(function (time) {\n        camera.render();\n    });\n}\nrunGame(\"game-canvas\");\n\n\n//# sourceURL=webpack://raycaster-game/./src/game.ts?");

/***/ }),

/***/ "./src/gameloop.ts":
/*!*************************!*\
  !*** ./src/gameloop.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"GameLoop\": () => (/* binding */ GameLoop)\n/* harmony export */ });\nvar GameLoop = /** @class */ (function () {\n    function GameLoop() {\n        var _this = this;\n        this.frame = function (currTime) {\n            // How many seconds have passed, is probably a small fraction:\n            var secs = (currTime - _this.lastTime) / 1E3;\n            _this.lastTime = currTime;\n            if (secs <= 1) {\n                _this.callback(secs);\n            }\n            requestAnimationFrame(_this.frame);\n        };\n        this.frame.bind(this);\n        this.lastTime = 0;\n    }\n    GameLoop.prototype.begin = function (callb) {\n        this.callback = callb;\n        requestAnimationFrame(this.frame);\n    };\n    return GameLoop;\n}());\n\n\n\n//# sourceURL=webpack://raycaster-game/./src/gameloop.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/game.ts");
/******/ 	
/******/ })()
;