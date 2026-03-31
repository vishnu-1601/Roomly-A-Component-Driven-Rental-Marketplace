const mongoose=require("mongoose");
const Listing=require("../models/listing.js");
const initData=require("./data.js");

const Mongo_url='mongodb://127.0.0.1:27017/wanderlust';
main().then(() => console.log("Connected to MongoDB")).catch(err => console.log(err));
async function main() {
    await mongoose.connect(Mongo_url);
}

const initDB = async () => {
    try {
        await Listing.deleteMany({});
        await Listing.insertMany(initData.data);
        console.log("data was initialized");
    } catch (err) {
        console.log(err);
    }
};

initDB().then(() => {
    mongoose.connection.close();
});