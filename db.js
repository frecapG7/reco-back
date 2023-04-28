

const mongoose = require('mongoose');
const config = require('config');

const database = config.get("db");


mongoose.connect(`mongodb+srv://${database.username}:${database.password}@${database.schema}`,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error(err));

module.exports = mongoose;