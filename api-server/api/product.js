
const router = require('express').Router();
const productController = require('./_controller/productController');


// create
router.post("/", async (req, res) => {
    const result = await productController.create(req);
    res.json(result);
})

// list
router.get("/", async (req, res) => {
    const result = await productController.list(req);
    res.json(result);
})

// update
router.put('/:product_id', async (req,res) =>{
    const result = await productController.update(req);
    res.json(result);
})

// delete
router.delete('/:product_id', async (req,res) => {
    const result = await productController.delete(req);
    res.json(result);
})

// 재고부족찾기
router.get('/stockcheck', async (req, res) => {
    const result = await productController.outofstock(req);
    res.json(result);
})



module.exports = router;

