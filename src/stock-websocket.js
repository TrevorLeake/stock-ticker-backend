

const { queryAlphaVantage } = require('./external-api.js')

const clients = []
let sendNumbers = false

function handleClient(thisClient, request) {
  console.log("new websocket client connection..."); 
  clients.push(thisClient);

  let last_stock_state = null;
  let last_query = null
  let last_date = null

  function endClient() {
    // remove client from list when client closes their connection
    var position = clients.indexOf(thisClient);
    clients.splice(position, 1);
    console.log("client connection closed.");
  }

  function sendNumber() {
    if(!sendNumbers || !last_query)
      return

    last_date = new Date(last_date);
    last_date.setDate(last_date.getDate() + 1);
    last_date = last_date.toDateString()

    let r = Math.random
    
    const random_old_state = last_query[Math.round(Math.random()*last_query.length)] 
    const type = 'stock-update'
    console.log(`ws:-> stock-update`)
    thisClient.send(
      JSON.stringify({ 
      type: type,
      data: {...random_old_state, date: last_date}
    }))
    setTimeout(sendNumber, 10000)
  }
  setTimeout(sendNumber, 10000)
  

  async function clientRequest(message) {
    const { type, body: ticker } = JSON.parse(message.toString())
    if(type === 'unsubscribe') {
      sendNumbers = false
      return
    } else {
      sendNumbers = true
    }

    const data = await getStock(ticker)
    console.log(`ws:-> ${ticker} batch (${data.data.length})`)

    thisClient.send(JSON.stringify(data))
  }


  async function getStock(stockSymbol) {
    console.log(`ws<-: client request for ${stockSymbol}` )

    let data
    let useExternalAPI = ('true' === process.env.USE_EXTERNAL_API)
    if(useExternalAPI) {
      data = await queryAlphaVantage(stockSymbol) 
    }
    else {
      console.log('setting: no-external-api -- sending mock')
      data = require('./alphavantage-daily-object.json');
    }
    
    data = data['Time Series (Daily)']

    // transform data from alphavantage format to one for our chart 
    // { time1: { open, close, high, low, volume}, time2: {...}, ...} ; time-keyed stock-state dictionary/map
    // -- transform to --> 
    // [{ time1, open, close, high, low, volume }, {time2, ...}, ... ] ; ordered list of stock-states
    const list = []
    for (const [datetime, stockState] of Object.entries(data)) {
        const [date, time] = datetime.split(' ') // example '2024-10-28 19:55:00'

        const formatted_stock_state = {
          date: date, 
          open: stockState["1. open"],
          high: stockState["2. high"],
          low: stockState["3. low"],
          close: stockState["4. close"],
          volume: stockState["5. volume"],
        }
        list.push(formatted_stock_state)
    
        last_date = date
    }
    last_query = list

    return { data: list, type: 'stock-batch' } // make is JSON object
  }

  // set up client event listeners:
  thisClient.on("message", clientRequest);
  thisClient.on("close", endClient);
}


module.exports = handleClient
