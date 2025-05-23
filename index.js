const express = require('express')
const cors = require('cors');
require('dotenv').config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2vxppji.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // all collections here
    const blogsCollection = client.db('techBlogsDB').collection('blogs');

    // all routes here
    app.get('/', (req, res) => {
      res.send('Server is running')
    })

    // get all blogs
    app.get('/blogs', async (req, res) => {
      //search from db
      const { searchParams } = req.query;
      let query = {};
      if (searchParams) {
        query = {
          $or: [
            { title: { $regex: searchParams, $options: "i" } },
            { author: { $regex: searchParams, $options: "i" } }
          ]
        };
      }

      const result = await blogsCollection.find(query).toArray();
      res.send(result);
    })
    // get a single blog
    app.get('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await blogsCollection.findOne(query);
      res.send(result);
    })
    // post / create a user
    app.post('/blogs', async (req, res) => {
      const userData = req.body;
      const result = await blogsCollection.insertOne(userData);
      res.send(result);
    });

    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});