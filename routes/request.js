
const express = require('express');
const router = express.Router();


router.get('', (req, res) => {
    res.send('Hello World!');
}
);

router.get('/:id', (req, res) => {
 res.send(`${req.params.id} is the id you specified`);
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

