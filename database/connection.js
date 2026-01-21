const mongoose=require('mongoose')
mongoose.connect(process.env.DATABASE).then(()=>{
    console.log("MongoDB Atlas Connected");
    
}).catch(err=>{
    console.log(`Atlas not connected ${err}`);
    
})