const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:27017/${process.env.DB_NAME}?authSource=admin`;

MongoClient.connect(uri)
  .then(client => {
    const db = client.db(process.env.DB_NAME);
    const items = db.collection('items');

    app.get('/', async (req, res) => {
      const allItems = await items.find().toArray();
      res.render('index', { items: allItems });
    });

    app.post('/add', async (req, res) => {
      await items.insertOne({ name: req.body.name, completed: false });
      res.redirect('/');
    });

    app.get('/done/:id', async (req, res) => {
      await items.updateOne({ _id: ObjectId(req.params.id) }, { $set: { completed: true } });
      res.redirect('/');
    });

    app.get('/undone/:id', async (req, res) => {
      await items.updateOne({ _id: ObjectId(req.params.id) }, { $set: { completed: false } });
      res.redirect('/');
    });

    app.get('/delete/:id', async (req, res) => {
      await items.deleteOne({ _id: ObjectId(req.params.id) });
      res.redirect('/');
    });

    app.listen(3000, () => console.log('App escuchando en puerto 3000'));
  })
  .catch(err => console.error('Error de conexión a MongoDB:', err));
