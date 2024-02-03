

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const routes = require('./routes/routes');
const mongoose = require('./db');
const pino = require('pino-http');
const handleError = require('./middleware/errorMiddleware');


app.use(pino());
app.use(bodyParser.json());
app.use('/', routes);
app.use(handleError)







const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB...');
    app.listen(process.env.PORT, '0.0.0.0', () => {
        console.log('Example app listening on port 3000!');
    }
    );
}
);
