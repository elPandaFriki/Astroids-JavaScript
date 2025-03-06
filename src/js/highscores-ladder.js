import { Constants } from "./constants.js";

export class HighScoresLadder {
  constructor() {
    this.execute();
    setInterval(() => {
      this.execute();
    }, 1000);
  }

  execute() {
    const different = this.retrieve();
    if (!different) {
      return;
    }
    this.generate();
  }

  scores = [];

  retrieve() {
    let scores =
      JSON.parse(localStorage.getItem(Constants.SAVE_KEY_SCORE)) || [];
    if (!Array.isArray(scores)) {
      scores = [];
      localStorage.setItem(Constants.SAVE_KEY_SCORE, JSON.stringify(scores));
    }
    if (JSON.stringify(this.scores) === JSON.stringify(scores)) {
      return false;
    }
    this.scores = scores;
    return true;
  }

  generate() {
    const tableElement = document.getElementById("highscores-table");
    tableElement.innerHTML = "";
    for (let i = 0; i < 10; i++) {
      const score = this.scores.sort((a, b) => b - a)[i];
      const row = document.createElement("tr");
      const rank = document.createElement("td");
      const textBox = document.createElement("div");
      textBox.textContent = score ? score : "";
      rank.appendChild(textBox);
      row.appendChild(rank);
      tableElement.appendChild(row);
    }
  }
}
