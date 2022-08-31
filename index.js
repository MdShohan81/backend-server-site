const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 4000;



// middleware 
app.use(cors())
app.use(express.json());




function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'unAuthorized Access'})
    }
            console.log('inside verifyJWT',authHeader);
            next();
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.or00c5l.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db('carspot_project').collection('service');
        const orderCollection = client.db('carspot_project').collection('order');


        // AUth 
        app.post('/login', async(req, res) =>{
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({accessToken});
        })



        


        //get service api
        app.get('/service', async(req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
        
        //get single service api
        app.get('/service/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        //Update data
        app.put('/service/:id', async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true};
            const updatedDoc = {
                $set: {
                    ...updatedItem,
                }
            };
            const result = await serviceCollection.updateOne(filter,updatedDoc,options);
            res.send(result);
        });

        // Added Product api
        //POST
        app.post('/service',async(req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })

        //Delete api
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        });


        //post order api
        app.post('/order', async(req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        app.delete('/order/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await orderCollection.deleteOne(query);
            res.send(result)
        })



        //get Order api

        app.get('/order', verifyJWT, async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

        

        
        })
    }
    finally{

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello carspot')
})

app.listen(port, () => {
    console.log(`carspot app listeing ${port}`)
})