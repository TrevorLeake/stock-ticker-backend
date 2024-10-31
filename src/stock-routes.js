const sqlite3 = require('sqlite3').verbose();

const express = require("express");
const router = express.Router()
router.use(express.json());
const cors = require("cors");
router.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// DB connection
const db = new sqlite3.Database('./app.db', (err) => {
	if(err) {
		return console.log(err.message);
	}
	console.log("connected to sqlite3 db")
});


// GET ALL
router.get('/', async (req, res) => {
    console.log('GET /stocks')
    db.all('SELECT * FROM stocks;', (err, rows) => { res.send({ status: 200, rows }) })
})

// ADD
router.post('/:stockSymbol', (req, res) => {
    const ticker = req.params.stockSymbol;
    console.log(`POST /stocks/${ticker}`)
    
    if(!ticker) {
        res.status(400).send('error');
        return
    }

    db.run(`INSERT into stocks values("${ticker}")`);    
    res.status(200).send('OK');
})

// DELETE
router.delete('/:stockSymbol', async (req, res) => {
    const { stockSymbol } = req.params
    console.log('DELETE /stocks', stockSymbol) 

    db.run(`DELETE FROM stocks WHERE ticker="${stockSymbol}"`);
    res.status(200).send('OK');
})

module.exports = router