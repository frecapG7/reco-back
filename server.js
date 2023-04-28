

const express = require('express');
const app = express();

const request = require('./routes/request');

const mongoose = require('./db');


app.use('/requests', request);
app.get('/', (req, res) => {
    res.send('Hello World!');
}
);


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
