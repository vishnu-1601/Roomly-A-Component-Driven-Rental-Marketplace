const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const { nextTick } = require("process");
const wrapAsync=require("./utils/wrapAsync");
const ExpressError=require("./utils/ExpressError");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

const port=8080;
app.listen(port,() => {
    console.log(`Server is Listening through port ${port}`);
})

const Mongo_url='mongodb://127.0.0.1:27017/wanderlust';
main().then(() => console.log("Connected to MongoDB")).catch(err => console.log(err));
async function main() {
    await mongoose.connect(Mongo_url);
}

app.get("/", (req,res) => {
    res.send("Hi, I am root");
})

// app.get("/testListing",async (req,res) => {
//     let sampleListing=new Listing({
//         title : "My New Villa",
//         description : "By the Beach",
//         price : 1200,
//         location : "Calangute, Goa",
//         country : "India"
//     })
//     await sampleListing.save();
//     console.log(sampleListing);
//     res.send("Successful Testing!");
// });

app.post("/test", (req, res) => {
    console.log("TEST HIT");
    res.send("Working");
});

//Index route
app.get("/listings",wrapAsync( async (req,res) => {
    const allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
}));

//New Route
app.get("/listings/new",(req,res) => {
    res.render("./listings/new.ejs");
});

//Show route
app.get("/listings/:id",wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing=await Listing.findById(id);
    res.render("./listings/show.ejs",{listing});
}));

//Create route
app.post("/listings",wrapAsync(async (req,res,next) => {
        if(!req.body || !req.body.listing){
            throw new ExpressError(400,"send valid data for listing");
        }
        if(!req.body.listing.image || !req.body.listing.image.url || req.body.listing.image.url.trim()===""){
            const randomImages = [
                "https://picsum.photos/300?random=1",
                "https://picsum.photos/300?random=2",
                "https://picsum.photos/300?random=3",
                "https://picsum.photos/300?random=4"
            ];
            const ridx=Math.floor(Math.random()*randomImages.length);
            req.body.listing.image={
                filename : "default-image",
                url:randomImages[ridx]
            };
        };
        let newListing=new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));

//edit route
app.get("/listings/:id/edit",wrapAsync(async (req,res) =>{
    let {id} = req.params;
    const listing=await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
}));

//put route after edit page submit (update route)
app.put("/listings/:id",wrapAsync( async (req,res) =>{
    if(!req.body || !req.body.listing){
        throw new ExpressError(400,"send valid data for listing");
    }
    let {id}=req.params;
    //if image field exists
    if(req.body.listing.image && req.body.listing.image.url){
        req.body.listing.image={
            filename : "listingimage",
            url : req.body.listing.image.url
        }
    }
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));

app.delete("/listings/:id",wrapAsync( async (req,res) => {
    let {id}=req.params;
    let deletedList=await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    res.redirect("/listings");
}));

//custom error handling
// app.use((err,req,res,next) => {
//     res.status(500).send(err.message);
// });

//expressError handler
app.all(/.*/,(req,res,next) => {
    next(new ExpressError(404,"Page not found!"));
});
app.use((err,req,res,next) => {
    let {statusCode=500,message="Something went wrong"}=err;
    // res.status(statusCode).send(message);
    res.render("./listings/error.ejs",{message : message});
});