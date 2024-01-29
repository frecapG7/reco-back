
const express = require('express');
const router = express.Router();

const requestService = require('../service/requestService');
const { authenticateToken } = require('../validator/auth');



/**
 * GET /requests/:id
 */
router.get('/:id', async (req, res, next) => {
    try {
        const request = await requestService.getRequest(req.params.id);
        res.status(200).json(request);
    } catch (err) {
        next(err);
    }

});


/**
 * POST /requests
 */
router.post('', authenticateToken, async (req, res, next) => {

    try {
        const request = await requestService.createRequest(req.body, req.userId);
        res.status(201)
            .json(request);
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /requests/:id
 */
router.put('/:id', authenticateToken, async (req, res, next) => {
    try {
        const savedRequest = requestService.updateRequest(req.params.id, req.body, req.userId);
        res
            .status(204)
            .json(savedRequest);
    } catch (err) {
        next(err);
    }
}
);

/**
 * DELETE /requests/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const request = requestService.deleteRequest(req.params.id, req.userId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
);


/**
 * 
 */
router.get('', authenticateToken, async (req, res, next) => {

    try{
        const pageNumber = parseInt(req.query.pageNumber) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const type = req.query.type || null;
        const status = req.query.status || null;
        const me = Boolean(req.query.me) || false;


        const filter = {
            ...(type && { requestType: type }),
            ...(status && { status: status }),
            ...(me && { author: req.userId }),
        }

        const results = await requestService.search(filter, pageSize, pageNumber);
        return res.json(results);

    }catch(err){
        next(err);
    }
    



    



});


module.exports = router;

