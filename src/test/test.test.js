const axios = require('axios')

const { describe, expect, test } = require('@jest/globals');


// describe('audio', async () => {
//   test('audio upload')  
// })

test('Stockslist add, delete test', async() => {
  // list tickers
  const response = await axios.get('http://localhost:3000/stocks/')
  const { data } = response

  const tickers = data.rows.map(d => d.ticker)
  console.log(tickers)
  //   expect(data.ids.includes(id)).toBe(true);

  const { tickerData } = await axios.get(`http://localhost:3000/ticker`, { body: { ticker: 'AAPL' }})
  console.log(tickerData)
  return
  // Delete audio by id
  response = await axios.delete(`http://localhost:3000/ticker/`)   
  expect(response.status).toBe(200);

  
  // List audio and check if id is NOT in list
  response = await fetch('http://localhost:3000/dev/audio/list')
  data = await response.json()
  expect(data.ids.includes(id)).toBe(false);
  expectFileExists(s3OfflineDirectory, bucket, id, false);
});