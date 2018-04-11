const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const accountRoter = require('./routes/account-routes');

const app = express();

const dbName = 'FoodDelivery';
const connectionString = `mongodb://localhost:27017/${dbName}`;

mongoose.connect(connectionString);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/account', accountRoter);

const server = app.listen(3000, () => {
  console.log(`Server listening on port ${server.address().port}`);
});
