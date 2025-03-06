import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  next();
});

// Middleware to check file extensions
app.use((req, res, next) => {
  const filePath = path.join(__dirname, "../", req.url);
  if (!fs.existsSync(filePath) && !path.extname(req.url)) {
    const extensions = [".js", ".css", ".html", ".png", ".jpg"];
    for (const ext of extensions) {
      if (fs.existsSync(filePath + ext)) {
        req.url += ext;
        break;
      }
    }
  }
  next();
});

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
