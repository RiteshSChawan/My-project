const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const url = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(url);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map(obj => ({
      ...obj,
      owner: '67d19d0abd689e8b53ad3d7e',
      geometry: obj.geometry || { type: "Point", coordinates: [0, 0] } // Default to [0,0]
  }));
  await Listing.insertMany(initData.data);
  console.log("Database initialized with listings!");
};

initDB();

