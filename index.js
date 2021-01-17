const express = require('express')
const app = express()
const cors = require('cors')

app.set('view engine', 'ejs')

app.get("/", (req, res, next) => {
    res.render('index')
})



const PORT = process.env.PORT || '5000'
app.listen(PORT, () => { console.log(`Server running in port: ${PORT}`) })