const express = require('express')
const path = require('path')
const stocks = require('./stocks')

const app = express()
app.use(express.static(path.join(__dirname, 'static')))

app.get('/stocks', async (req, res) => {
    const stockSymbols = await stocks.getStocks()
    res.send({ stockSymbols })
})

app.get('/stocks/:symbol', async (req, res) => {
    const { params: { symbol } } = req

    let data;
    try {
        data = await stocks.getStockPoints(symbol, new Date())
    } catch (err) {
        res.status(500);
        data = "failed to retrieve stock"
    }
    res.send(data)
})

app.listen(3000, () => console.log('Server is running!'))
