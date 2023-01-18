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

app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());
app.use(cors(corsOptions))

//Password
const p = "xlUo2U1F3zr2GQC6"
const uri = `mongodb+srv://online-tutor:${p}@cluster0.s9hhkxb.mongodb.net/?retryWrites=true&w=majority`

//DataBase Connection with MongoDB

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  console.log("Database Connected Successfully")
  const studentdb = client.db("online-tutor").collection("Student");
  const tutordb = client.db("online-tutor").collection("Tutor");
  const postsdb = client.db("online-tutor").collection("post");

   //Register New -- POST Method----------------------------------
   app.post("/newUser", async (req, res)=>{
    console.log("waiting for post req")
     const newUser = req.body;
    console.log("New User DAta",newUser)
    console.log(newUser)
    await res.send(newUser);
  })

  //GET Student Login DB--------------------------
  app.get("/allstudentdb", async (req, res)=>{
    studentdb.find({})
    .toArray((err, document)=>{
      res.send(document);
    })
  })
  //GET Student DB--------Admin---------------------------
  app.get("/allstudentdb",async (req, res)=>{
    studentdb.find({})
    .toArray((err, document)=>{
      res.send(document);
    })
  //GET Tutor  DB---------Admin--------------------------
  app.get("/alltutordb",async (req, res)=>{
    tutordb.find({})
    .toArray((err, document)=>{
      res.send(document);
    })
  })
  //GET AllPosts  DB----------Public--------------------------
  app.get("/allpostdb", async(req, res)=>{
    postsdb.find({})
    .toArray((err, document)=>{
      res.send(document);
    })
  })


  })
})

//Server Running at given
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  })
