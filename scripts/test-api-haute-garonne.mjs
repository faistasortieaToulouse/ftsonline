// test-api-haute-garonne.js

import fetch from "node-fetch";

async function testEndpoints() {
  const base = "https://data.haute-garonne.fr/api/explore";
  const dataset = "evenements-publics";
  const limits = 10;

  const versions = ["v2.1", "v2.0", "v2"];
  for (const version of versions) {
    const url = `${base}/${version}/catalog/datasets/${dataset}/records?limit=${limits}`;

    try {
      const res = await fetch(url);
      const text = await res.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }

      console.log("===== Version testée:", version);
      console.log("URL:", url);
      console.log("Status:", res.status, res.statusText);
      console.log("Body:", body);
      console.log("\n");
    } catch (err) {
      console.error("Erreur fetch version", version, err);
    }
  }
}

testEndpoints();
