const API_KEY = '19Y3HjuTP1BKGOc_t7uUiO6t8XH5T3uc'


var WebSocketServer = require('websocket').server;
var http = require('http');


const express = require('express')
const endpoint= `https://api.polygon.io/v3/reference/tickers`

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./app.db', (err) => {
	if(err) {
		return console.log(err.message);
	}
	console.log("Connected to database!")
});


const app = express();
app.use(express.json()); 


// ADD
app.post('/stocks', async (req, res) => {
    const { ticker } = req.body;
    
    db = db.run(`INSERT into stocks values("${ticker}")`);    
    res.status(200).send('OK');
})

// DELETE
app.delete('/stocks', async (req, res) => {
    const { ticker } = req.body;
    // T ...
    db.run(`DELETE FROM stocks WHERE ticker="${ticker}"`);
    res.status(200).send('OK');
})


// GET ALL
app.get('/stocks', async (req, res) => {
    // pull from DB
    db.all('SELECT * FROM stocks;', 
        (err, rows) => { 
            res.send({ status: 200, rows }) 
        }
    )
})

function rand(min, max) {
    return Math.random() * (max - min) + min;
}
 
app.get('/ticker', async (req, res) => {
    // -- live ticker? websocket?
    // pull from DB

    db.all('SELECT * FROM stocks;', 
        (err, rows) => { 
            rows.forEach(row => {
                const ticker = row.ticker
                // console.log(`Ticker: ${ticker}`)
                //YAHOO
                // or num
                rand(0, 1e4);

                // TODO -- websocket
            })

        }
    )
})


const PORT = 3000

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});



