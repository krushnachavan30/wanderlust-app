const mongoose=require("mongoose");
const Listing=require("../models/listing.js");
const initdata=require("./data.js");    

async function main() 
{
 await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");   
}
main().then(res =>{ console.log("connected to db")})
.catch(err =>{ console.log(err)});


const initDB= async()=>{

    await Listing.deleteMany({});
initdata.data=initdata.data.map((obj)=>({
    ...obj, owner:"69b3f99404063c29b1f11204"
}))
await Listing.insertMany(initdata.data);
console.log("data was initialize");
}
initDB();