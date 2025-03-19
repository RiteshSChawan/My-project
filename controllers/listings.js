const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req,res)=>{
   
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async (req, res, next) => { 
    let response  = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send();

    let  url = req.file.path;
    let filename = req.file.filename  ;

    const newListing = new Listing(req.body.listing);

    // Ensure default image is applied if not provided
    // if (!newListing.image || !newListing.image.url) {
    //     newListing.image = {
    //         url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
    //     };
    // }
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    if (response.body.features.length === 0) {
        newListing.geometry = { type: "Point", coordinates: [0, 0] }; // Default fallback
    } else {
        newListing.geometry = response.body.features[0].geometry;
    }
    
    let savedListing = await newListing.save();
    
    req.flash("success","New listing created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing does not exist!");
        res.redirect("/listings");
    }
    let originalUrl = listing.image.url;
    originalUrl = originalUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs",{listing, originalUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
   
    let updatedListing = req.body.listing;

    // // Ensure default image isn't removed
    // if (!updatedListing.image || !updatedListing.image.url) {
    //     updatedListing.image = {
    //         url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
    //     };
    // }

    let listing = await Listing.findByIdAndUpdate(id, updatedListing);
    if(typeof req.file !=="undefined"){
        let  url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
   

    req.flash("success","listing updated!");

    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","listing deleted!");
    res.redirect("/listings");
};