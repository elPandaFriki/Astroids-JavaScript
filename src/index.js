import { Game } from "./game";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
new Game();

export { canvas, ctx };
