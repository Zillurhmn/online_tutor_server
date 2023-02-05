const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const BodyParser = require('body-parser')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;

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
const p = "xlUo2U1F3zr2GQC6"
const uri = `mongodb+srv://online-tutor:${p}@cluster0.s9hhkxb.mongodb.net/?retryWrites=true&w=majority`

//DataBase Connection with MongoDB

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// ==========================================Public Posts Database Connection=============================================================
client.connect(err=>{
  const postsdb = client.db("online-tutor").collection("post");
  console.log("Publice post Database connected")
  //GET AllPosts  DB----------Public--------------------------
  app.get("/allpostdb", (req, res)=>{
    // const ob={
    //   tutorId : "63c97ad8827f2d2f86098b0a",
    //   Name: 'Priyanka Mukharjee' ,
    //   Subject: 'CSE',
    //   education: "MSC-City University",
    //   topicName:"OOP in Java",
    //   topicDescription: "Provident Topic  Description et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.",
    //   amount: "2500/-",
    //   totalTime: "10hour",
    //   keyword : "CSE Learning Grammer",
    //   Review: "412",
    // }
    // postsdb.insertOne(ob)
    console.log("Getting posts db")
    postsdb.find({})
    .toArray((err, document)=>{
      res.send(document);
      // console.log("send All posts db",document)
    })
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
    studentdb.find(User)
    .toArray((err, document)=>{
      res.send(document);
      console.log("Documents ", document)
    })
  })
  //GET Student DB--------Admin---------------------------
  app.get("/allstudentdb", (req, res)=>{
    studentdb.find({})
    .toArray((err, document)=>{
      res.send(document);
      
    })


  })
})

// =========================================Tutors Database Connection===============================================================----
client.connect(err=>{
  console.log("Tutors Database connected")
  const tutordb = client.db("online-tutor").collection("Tutor");

  //POST  Tutors Login DB--------------------------
  app.post("/login/tutor",  (req, res)=>{
    const User = req.body;
    tutordb.find(User)
    .toArray((err, document)=>{
      res.send(document);
      console.log("Documents ", document)
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
// app.get("/",(req,res)=>{
//   const ob = {
//     name: "Priyanka Mukharjee",
//     email: "priyanka@gmail.com",
//     password: "123",
//     user:"tutor",
//     subject:"CSE",
//     description:"Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.",
//     education:"MSC-City University",
//   }
//   tutordb.insertOne(ob)
//   res.send(tutordb)
// })
})
// ==================================================================================
//Server Running at given
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  })
