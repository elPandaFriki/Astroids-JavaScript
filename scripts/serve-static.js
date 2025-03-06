import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Serve the index.html file
app.get("/", (req, res) => {
  console.log("Serving index.html");
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Serve static files from the src folder
app.use("/src", express.static(path.join(__dirname, "../src")));

// Serve the favicon.png file
app.get("/favicon.png", (req, res) => {
  console.log("Serving favicon.png");
  res.sendFile(path.join(__dirname, "../favicon.png"));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
