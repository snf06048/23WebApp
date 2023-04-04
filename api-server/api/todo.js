
const router = require('express').Router();
const todoController = require('./_controller/todoController');
router.get('/', async (req,res)=>{
    const fuck = todoController.getTest();
    res.json(fuck);
})

module.exports = router;