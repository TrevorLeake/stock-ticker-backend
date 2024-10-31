const { URLSearchParams } = require('url');
const fetch = require('node-fetch');


async function queryAlphaVantage(stockSymbol) {
    // TODO -- options list for interval, symbol...
    const response = await fetch('https://www.alphavantage.co/query?' + new URLSearchParams({ 
        function: 'TIME_SERIES_DAILY', 
        symbol: stockSymbol, 
        // interval: '5min', 
        apikey: process.env.STOCK_API_KEY
    }))
    return await response.json()
}

module.exports = {queryAlphaVantage}