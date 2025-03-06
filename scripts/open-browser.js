import open from "open";

const port = 3000;
const url = `http://localhost:${port}`;

open(url).then(() => {
  console.log(`Browser opened at ${url}`);
});
