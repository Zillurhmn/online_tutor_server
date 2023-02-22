const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const BodyParser = require('body-parser')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;
const SSLCommerzPayment = require('sslcommerz-lts')
const env = require('dotenv').config()
const window = require('window')
const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

const port = 5000
const app = express()

// app.use(BodyParser.urlencoded({ extended: true }));
// app.use(BodyParser.urlencoded());
app.use(BodyParser.json());
app.use(cors())


//Password
const uri = process.env.URI


//----------SSL Info Data Variable----------------
const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PWD
const is_live = false //true for live, false for sandbox
// console.log(store_passwd)


//DataBase Connection with MongoDB

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// ==========================================Public Posts Database Connection=============================================================
client.connect(err=>{
  const postsdb = client.db("online-tutor").collection("post");
  console.log("Publice post Database connected")
  //GET AllPosts  DB----------Public--------------------------
  app.get("/allpostdb",async (req, res)=>{
    console.log("Getting posts db")
    let allpostdb ;
    await postsdb.find({}).toArray().then(data => res.send(data))
    
  })
  
  //-------------------------------------Search posts by Id -----------------------
  app.get("/posts/:id",async(req,res)=>{
    const id= req.params.id;
    const arr = await postsdb.find({'tutorId':id}).toArray()
    // console.log(arr);
    res.send(arr) 
    
  })

  //-------------------------------------Get Delete Post--------------------------
  app.get("/Deletepost/:id",async(req,res)=>{
    const id= req.params.id;
    await postsdb.findOneAndDelete({'_id':ObjectId(id)})
    .then(
    result => {
      console.log(result.value)
      res.send(result.value) })    
    
  })

  //-------------------------------------Creating New post----------------
  app.post("/CreatePost",(req,res)=> {
    const newPost = req.body;
    console.log("new post request data", newPost)
    postsdb.insertOne(newPost)
    res.send(newPost)
  })

  //=================================Update Tutor's Post  in PostsDB database-----------------------------------
  app.post("/editpost/:id",async(req,res)=> {
    const id= req.params.id;
    const editedPost = req.body;
    console.log(editedPost);
    const newUpdatedPost = {$set :editedPost}
    await postsdb.updateOne({'_id':ObjectId(id)},newUpdatedPost)
    .then(
    result => {
      console.log(result)
      res.send(result) })
    .catch(err=>console.log("finding related Error",err))

  })
// -----------------------------find Enrollment Id------------------------
  app.get("/enrollData/:studentId",async(req,res)=>{
    const queryId= req.params.studentId;
    const enrolled = await postsdb.find({"enroll":{ $elemMatch: {"id":queryId}}}).toArray();
    // console.log("enroll data-->",enrolled)
    res.send(enrolled)
  })

  //------------------------student review after completing course--------------
  app.post("/review/:postId/:studentId",async(req,res)=>{
    const postId= req.params.postId;
    const queryId= req.params.studentId;
    const reviewData = req.body;
    // const query = { "enroll.id": queryId };
    const updateDocument = {
      $set: { "enroll.$[aaa]": {...reviewData}}
    };
    const filter = {
      arrayFilters: [{  
        "aaa.id" : queryId
      }]

    }
    const postData = await postsdb.updateOne({"_id":ObjectId(postId), "enroll.id":queryId},updateDocument,filter)
    // const result = await pizza.updateOne(query, updateDocument);
    // const result = await postData. 
    console.log(postData);
    res.send(postData);
  })


    // -----------------------SSL commerz--------------==========================

  //sslcommerz init
  app.get('/init/:postId/:studentId', async(req, res) => {
    const postId = req.params.postId;
    const studentId = req.params.studentId;
    console.log("type  of postId is ",typeof(postId),"type of studentId is ",typeof(studentId));
    let post;
    await postsdb.findOne({'_id': ObjectId(postId)}).then(data=> post = data)
    const success_url = `http://localhost:5000/success/${postId}/${studentId}`
    // console.log(success_url, " type of this is", typeof(success_url))
    // console.log(typeof(`${post._id}`))
    const data = {
        total_amount: +(post.amount),
        currency: 'BDT',
        tran_id: `REF12345678`, //  use unique tran_id for each api call
        success_url: (success_url),
        fail_url: 'http://localhost:5000/fail',
        cancel_url: 'http://localhost:5000/cancel',
        ipn_url: 'localhost:5000/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01867074943',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, false)
    sslcz.init(data).then(apiResponse => {
      // console.log("Api is ",apiResponse);
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse?.GatewayPageURL;
        res.redirect(GatewayPageURL)
        // window.location.replace(GatewayPageURL)
        // console.log('Redirecting to: ', GatewayPageURL)
    });
  })
  //---------sslcommerz success link-----------
  app.post('/success/:postId/:studentId', async (req,res)=>{
    const postId = req.params.postId;
    const studentId = req.params.studentId;
    // console.log("postId is ",postId," studentId is ",studentId);

    let post;
    await postsdb.findOne({'_id': ObjectId(postId)}).then(data=> post = data)
    console.log(post,"After success")

    if(post.enroll){
      //------------if post and enroll found then-------------->
      console.log("post.enroll  found and-->")
      const updateDocument = {
        $push: { "enroll": {"id":studentId, "review":"","complete":false} }
      };

      await postsdb.updateOne({'_id':ObjectId(postId)},updateDocument)
      .then(
      result => {
        console.log(result,"After Enroll Result")
      })
      .catch(err=>console.log("finding related Error",err))
    }else{
      //----------------else post.enroll not found then----------->
      console.log("post.enroll not found and-->")
      const updateDocument = {
        $set: { "enroll": [{"id":studentId, "review":"","complete":false}] }
      };
      await postsdb.updateOne({'_id':ObjectId(postId)},updateDocument)
      .then(
      result => {
        console.log(result,"After Enroll Result")
      })
      .catch(err=>console.log("finding related Error",err))
    }
    
    res.redirect('http://localhost:3000')
  })
})

//=========================================Student Database Connection===============================================
client.connect(err => {
  console.log("Students Database Connected Successfully")
  const studentdb = client.db("online-tutor").collection("Student");
  

  //Register New -- POST Method----------------------------------
   app.post("/newUser/student",  (req, res)=>{
     const newUser = req.body;
    console.log("New User DAta",newUser)
    studentdb.insertOne(newUser)
     res.send(newUser);
  })

  //POST  Student Login DB--------------------------
  app.post("/login/student",  (req, res)=>{
    const User = req.body;
   
    studentdb.findOne(User)
    .then((data)=>{
      res.send(data);
      console.log("Student login Documents ", data)
    })
  })
  //GET Student DB--------Admin---------------------------
  app.get("/allstudentdb", (req, res)=>{
    studentdb.find({})
    .toArray((err, document)=>{
      res.send(document);
    })
  })

    //---------------------------Update Students Personal Data-------------------
    app.post("/editStudentProfile/:id",async(req,res)=>{
      const id = req.params.id;
      const updateDocument = req.body;
      console.log(updateDocument);
      const newUpdatedPost = {$set :updateDocument}
      await studentdb.updateOne({'_id':ObjectId(id)},newUpdatedPost)
      .then(
      result => {
        console.log(result)
        res.send(result) })
      .catch(err=>console.log("finding related Error",err))
    })
  
})

// =========================================Tutors Database Connection===============================================================----
client.connect(err=>{
  console.log("Tutors Database connected")
  const tutordb = client.db("online-tutor").collection("Tutor");

  //POST  Tutors Login DB--------------------------
  app.post("/login/tutor",  (req, res)=>{
    const User = req.body;
    tutordb.findOne(User)
    .then((document)=>{
      res.send(document);
      console.log("Tutor Login Documents ", document)
    })
  })
    //GET Tutor  DB---------Admin--------------------------
    app.get("/alltutordb", (req, res)=>{
      tutordb.find({})
      .toArray((err, document)=>{
        res.send(document);
      })
    })
    //Register New -- -------------POST Method----------------------------------
   app.post("/newUser/tutor",  (req, res)=>{
     const newUser = req.body;
    console.log("New User DAta",newUser)
    tutordb.insertOne(newUser)
     res.send(newUser);
  })
  //---------------------------Update Tutors Personal Data-------------------
  app.post("/editTutorProfile/:id",async(req,res)=>{
    const id = req.params.id;
    const updateDocument = req.body;
    console.log(updateDocument);
    const newUpdatedPost = {$set :updateDocument}
    await tutordb.updateOne({'_id':ObjectId(id)},newUpdatedPost)
    .then(
    result => {
      console.log(result)
      res.send(result) })
    .catch(err=>console.log("finding related Error",err))


  })

  })









// ==================================================================================
//Server Running at given
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  })
