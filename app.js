require('dotenv').config();
const express =require("express");
const app = express();
const path = require("path")
const hbs = require("hbs");
const ejs=require("ejs");
const user_route = express();
const router=express.Router()
// const multer =require("multer");
const jwt=require("jsonwebtoken");
const bodyParser = require('body-parser');
const fs = require('fs');
const  User=  require("./src/models/registers");
const passport=  require("passport");
const session = require("express-session");
const config = require("./config/config");

const fileupload=require('express-fileupload');
// const cloudinaryapp=require('cloudinary').v2;
const uploadd = require('./handlers/multer');
const cloudinary = require('./handlers/cloudinery');

const LocalStrategy=require("passport-local");
const passportLocalMongoose =  require("passport-local-mongoose");
require("./src/db/conn");
const Register=require("./src/models/registers")
const port= process.env.PORT || 5000

// const static_path=path.join(__dirname,"./public")
const template_path=path.join(__dirname,"./templates/views");
const partials_path=path.join(__dirname,"./templates/partials");
const auth = require("./middleware/auth");
const auth1 = require("./middleware/auth");
const auth2 = require("./middleware/auth");
const hide = require("./middleware/hide");
const cookieParser = require('cookie-parser');


app.use(express.urlencoded({extended:false}));
app.use(express.json());
// app.use(express.static(static_path));
app.set("view engine","hbs");
app.set('view engine','ejs');
app.use(cookieParser());
app.use(session({secret:config.sessionSecret}))
app.set("views",template_path);
hbs.registerPartials(partials_path);

app.use(fileupload({
    useTempFiles:true
}));
// cloudinary.config({
//     cloud_name:'djjvmuxcg',
//     api_key:'488427683597718',
//     api_secret:'g9PjRmOv4IrfJOPFwVISvYb5E1U'
// });
console.log(process.env.SECRET);
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public/uploads/')
//     },
//     filename: (req, file, cb) => {
//         cb(null, + Date.now()+file.originalname ,'.jpg','.png')
//     },
// });
// const fileFilter=(req,file,cb)=>{
//     if(file.mimetype==='image/jpeg' || file.mimetype==='image/jpg' || file.mimetype==='image/png'){
//         cb(null,true);
//     }else{
//         cb(null,false);
//     }

// };
// const upload=multer({storage:storage,
//     limits:{
//         fileSize:1024*1024*5
//     },
//     fileFilter:fileFilter
// }).single('image');
app.get('/cat',(req,res)=>{
    res.render("cat")
});
app.get('/secret',(req,res)=>{
    res.render("secret")
});
app.get('/hhf',function(req,res,next){

    Register.find({}, function (err, data) {
        if (!err) {
            res.render('hhf',{records:data});
        } else {
            throw err;
        }
    }).clone().catch(function(err){ console.log(err)})
    
});
app.get('/about',(req,res)=>{
    res.render("about")

});
app.get('/show',hide.isLogin,async(req,res)=>{
    //     try{
    //     const limitNumber=5;
    //     const categories=await Register.find({}).limit(limitNumber);
    //     res.render('show',{categories});
    // }catch(error){
    //     res.status(500).send({message:error.message|| "error occured"});
    // }
    // Register.find({}, function (err, data) {
    //     if (!err) {
    //         res.render('hhf',{records:data});
    //     } else {
    //         throw err;
    //     }
    // }).clone().catch(function(err){ console.log(err)})
    
    try {
        // const limitNumber = 10;
        const categories = await Register.find({}).limit();
        const latest = await Register.find({}).sort({ _id: -1 }).limit();

        const food={latest};
        res.render('show', { title: 'Cooking Blog - Explore Latest', categories,food } );
        // console.log(categories.firstname)
      } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
      }
      
    
});
app.get('/userprofile',async(req,res)=>{

    try {
        
        const userData = await Register.findById({ _id:req.session._id });
        res.render('userprofile',{ user:userData });

    } catch (error) {
        console.log(error.message);
    }
 
});
app.get('/detail/:id',async(req,res)=>{
    try {
        let recipeId = req.params.id;
        const recipe = await Register.findById(recipeId);
        res.render('detail', { title: 'Cooking Blog - Recipe', recipe } );
      } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
      }
});
app.get('/ind',async(req,res)=>{
    try {
        const limitNumber = 20;
        const categories = await Register.find({}).limit(limitNumber);
        const latest = await Register.find({}).sort({ _id: -1 }).limit(limitNumber);

        const food={latest};
        res.render('ind', { title: 'Cooking Blog - Explore Latest', categories,food } );
        // console.log(categories.firstname)
      } catch (error) {
        res.status(500).send({message: error.message || "Error Occured" });
      }
});
app.get('/contact',(req,res)=>{
    res.render("contact")

});
app.get('/',(req,res)=>{
   res.render("index");
});
app.get('/login',hide.isLogout,(req,res)=>{
    // try {


        // const oneuser = await Register.find({}).sort({ _id: -1 }).limit();

        // const singleuser={oneuser};
        // res.render('login', { title: 'Cooking Blog - Explore Latest',singleuser } );
    //   } catch (error) {
    //     res.status(500).send({message: error.message || "Error Occured" });
    //   }
    
    res.render("login")
});
app.get("/logout",async(req,res)=>{
//  try{

// req.user.tokens=req.user.tokens.filter((currElement)=>{
//     return currElement.token!= req.token
// })
    // res.clearCookie("jwt");

    try {
        
        req.session.destroy();
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }


console.log("logout susscessfully");
// await req.user.save();

// res.redirect("login");
//  }catch(error){
//     res.status(500).send(error);

//  }

});
app.get("/edit",async(req,res)=>{
    try {
        
        const id = req.query.id;
 
        const userData = await Register.findById({ _id:id });
 
        if(userData){
            res.render('edit',{ user:userData });
        }
        else{
            res.redirect('/userprofile');
        }
 
     } catch (error) {
         console.log(error.message);
     }
});
// app.put("/edit",async(req,res)=>{
//     const file= req.files.image;
//     cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{
//     try {
//         let user =await Register.findById(req.params.id);
//         const file= req.files.image;
//         await cloudinary.uploader.destroy(user.image);

//         const result=await cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{
//             console.log(result);
//             const data={
//                 image:result.url || user.image,
//             };
//             user=await Register.findByIdAndUpdate(req.params.id,data,{new:true});
//             res.json(user);
//         })
//            } catch(err){
//                 console.log(err);
//             }
//         })
//     })

app.post("/edit",async(req,res)=>{
    const file= req.files.image;
    console.log(req.body);
    cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{
        console.log(result);
      try{
        // if(req.file){
        //     const userData =  Register.findByIdAndUpdate({ _id:req.body.user_id },{ $set:{firstname:req.body.firstname, email:req.body.email, phonenumber:req.body.phonenumber, image:file.result.url} });
        // }  
        // else{
           const userData =  Register.findByIdAndUpdate({ _id:req.body.user_id },{ $set:{firstname:req.body.firstname, email:req.body.email, phonenumber:req.body.phonenumber,image:req.result} });
        // }

        res.redirect('/userprofile'),uploadd.single('image');

    } catch (error) {
        console.log(error.message);
    }
})
})

app.post('/login',async(req,res)=>{
    try{
       
    const email=req.body.email;
    const password=req.body.password;
  
    const useremail=await Register.findOne({email:email});
    const token=await useremail.generateAuthToken();
    
    console.log("the token part"+ token);
    res.cookie("jwt",token,{
        expires:new Date(Date.now()+60000),
        httpOnly:true
    });
    if(useremail.createpassword===password){
        // res.send(useremail.password);
        // console.log(useremail);
        // req.session.user_id=useremail._id;
        req.session._id = useremail._id;
        res.status(201).redirect("/show");
    }else{
        res.send("invalid login details");
    }
    } catch(error){
        res.status(400).send("invalid Email")
    }
    // req.session.loggedin = true
});

app.get('/Register',hide.isLogout,(req,res)=>{
    res.render("register")

})
app.post("/Register",(req,res)=>{
    console.log(req.body);
    const file= req.files.image;
    cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{
        console.log(result);
        try{
            const repeatpassword=req.body.repeatpassword;
            const createpassword=req.body.createpassword;
            // const imageFile=req.file.filename;
            if(repeatpassword===createpassword){
                const registeremp= new  Register({
                    // userid:req.body.userid,
                    firstname:req.body.firstname,
                    email:req.body.email,
                    phonenumber:req.body.phonenumber,
                    createpassword:createpassword,
                    repeatpassword:repeatpassword,
                    selectbloodgroup:req.body.selectbloodgroup,
                    address:req.body.address,
                    image:result.url
                });
                // const token=registeremp.generateAuthToken();
                // console.log("the token part"+ token);
                // res.cookie("jwt",token,{
                //     expires:new Date(Date.now()+60000),
                //     httpOnly:true
                // });
               
             registeremp.save(),uploadd.single('image');
             req.session._id = registeremp._id;
            
            res.status(201).redirect("/show");
            }else{
                res.send("password is not matching")
            }
                }catch(error){
                    res.status(500).json({message: error});
                    console.log("There was an error");
                }
            
    });

    // console.log(req.filename);

})
app.listen(port,()=>{
    console.log(`app is running on port ${port}`)
}) 