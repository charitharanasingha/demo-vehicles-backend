const axios = require("axios");
const express = require("express");
const cors = require("cors");
const NodeCache = require("node-cache");
const app = express();
const cache = new NodeCache();

app.use(cors());

app.get("/dealers", async (req, res) => {
  try {
    const response = await axios.get(
      "https://bb61co4l22.execute-api.us-west-2.amazonaws.com/development/dealers"
    );
    const dealers = response.data;
    cache.set("dealers", dealers);
    res.send(dealers);
  } catch (error) {
    const cachedData = cache.get("dealers");
    if (cachedData) {
      res.send(cachedData);
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
});

app.get("/vehicles/:bac", async (req, res) => {
    const bac = req.params.bac;
    try {
    const response = await axios.get(
      `https://bb61co4l22.execute-api.us-west-2.amazonaws.com/development/vehicles/${bac}`
    );
    const vehicles = response.data;
    cache.set(bac, vehicles);
    res.send(vehicles);
  } catch (error) {
    const cachedData = cache.get(bac);
    if (cachedData) {
      res.send(cachedData);
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
});

async function fetchAndCacheDealers() {
    const MAX_RETRIES = 3;
    let dealers;
  
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const response = await axios.get(
          "https://bb61co4l22.execute-api.us-west-2.amazonaws.com/development/dealers"
        );
        dealers = response.data;
        cache.set("dealers", dealers);
        break; // exit the loop if successful
      } catch (error) {
        console.error(`Error fetching dealers: ${error.message}`);
        if (i < MAX_RETRIES - 1) {
          console.log(`Retrying in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3 seconds before retrying
        } else {
          console.log(`Max retries reached, unable to fetch dealers.`);
        }
      }
    }
  }
  

const port = process.env.PORT || 3000;
const server = app.listen(port, async () => {
  //TODO : Add the dealers to the cache at the start with a retry until get to cache here
  
  await fetchAndCacheDealers().then(() => {
    console.log('Dealers fetched and cached successfully.');
  }).catch((error) => {
    console.error(`Error fetching and caching dealers: ${error.message}`);
  });

  console.log(`Server listening on port ${port}`);
});

module.exports = server; // export server object for testing
