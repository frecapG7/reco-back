

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const pino = require('./logger');
const routes = require('./routes/routes');
const mongoose = require('./db');
const handleError = require('./middleware/errorMiddleware');


// By default allow all origins
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Credentials',
        'Access-Control-Allow-Origin'],
    credentials: true
}));

// app.use(pino);

app.use(bodyParser.json());
app.use('/', routes);
app.use(handleError)







const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB...');
    app.listen(3000, () => {
        console.log('Example app listening on port 3000!');
    }
    );
}
);
