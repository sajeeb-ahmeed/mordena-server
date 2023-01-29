const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wbiyf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db('modernoFurniture').collection('inventory');
        console.log('db connected');

        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })


        //SERVICES API
        app.get('/services', async (req, res) => {
            const cursor = inventoryCollection.find()
            const services = await cursor.toArray();
            res.send(services)
        });

        //SINGLE SERVICE API
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.findOne(query);
            res.send(result);
        });

        //QUANTITY UPDATE API 
        app.put('/service/:id', async (req, res) => {
            const id = req.params.id;
            const user = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: user.newQuantity
                },
            };
            result = await inventoryCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        //QUANTITY DELIVERY API
        app.put('/delivery/:id', async (req, res) => {
            const id = req.params.id;
            const user = req.body;
            const deliver = user.quantity - 1;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: deliver
                },
            };
            result = await inventoryCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        //ITEM DELETE API
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        });
        //ADD ITEM API
        app.post('/add', async (req, res) => {
            const newItem = req.body;
            const result = await inventoryCollection.insertOne(newItem);
            res.send(result);
        });
        // JWT API


//         app.get('/add', verifyJWT, async (req, res) => {
//             const decodedEmail = req.decoded.email;
//             const email = req.query.email;
//             if (email === decodedEmail) {
//                 const query = { email: email };
//                 const cursor = inventoryCollection.find(query);
//                 const addItems = await cursor.toArray();
//                 res.send(addItems)
//             }
//             else {
//                 res.status(403).send({ message: 'forbidden access' })
//             }
//         })


    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running MEDERNA Server');
});


app.listen(port, () => {
    console.log('Listening to port', port);
})
