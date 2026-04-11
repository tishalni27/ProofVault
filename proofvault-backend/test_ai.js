const fs = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");

async function test() {
  console.log("starting test...");

  const form = new FormData();
  form.append("file", fs.createReadStream("test_will.pdf"));

  const res = await fetch("http://127.0.0.1:5002/check-will", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  const data = await res.json();
  console.log("STATUS:", res.status);
  console.log(data);
}

test().catch((err) => {
  console.error("ERROR:", err);
});