

const express = require('express');
const bodyParser = require('body-parser');
const app = express();


const routes = require('./routes/routes');
const mongoose = require('./db');


app.use(bodyParser.json());
app.use('/', routes);


app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
}
);


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB...');
}
);
