
const express = require('express');
const router = express.Router();

const Request = require('../model/request');


router.get('', async (req, res) => {
    const requests = await Request.find();
    res.json(requests);
}
);

router.get('/:id', async (req, res) => {
    const request = await Request.findById(req.params.id);
    if (!request) {
        res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);

});

router.post('', (req, res) => {
    res.send('POST request to the homepage');
}
);

router.put('/', (req, res) => {
    res.send('PUT request to the homepage');
}
);

router.delete('/:id', (req, res) => {
    res.send('DELETE request to the homepage');
}
);


module.exports = router;

