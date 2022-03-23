const express = require('express')
const app = express()
const cors = require('cors')
const fs = require('fs')
const multer = require('multer')
const { createWorker } = require('tesseract.js')

//// Create Worker ////
const worker = createWorker({
    logger: m => console.log(m)
})
///////////////////////

//////Cors///////
app.use(cors())

/////// Update Storage //////

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./upload")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage }).single('image')

///////////////////////////

app.set('view engine', 'ejs')

///// Router /////

app.get("/", (req, res, next) => {
    res.render('index')
})


app.post("/upload", (req, res, next) => {
    upload(req, res, next => {
        const path = `./upload/${req.file.originalname}`
        fs.readFile(path, async (err, data) => {
            if (err) return console.log({err})
            async function transform() {
                await worker.load();
                await worker.loadLanguage('spa');
                await worker.initialize('spa');
                const { data: { text } } = await worker.recognize(path);
                //await worker.terminate();
                return text
            }
            await transform()
                .then(el => {
                    const file = deleteFile(path)
                    res.send({ data: el, file }) 
                })
                .catch(err => {
                    const file = deleteFile(path)
                    res.send({ msg: err, file }) 
                })
        })
    })
})

const deleteFile = ( path ) => {
    fs.unlink(path, error => {
        if(error) return { 'status': error }
    })
    return {'status' : 'Deleted file'}
} 

//////////////////

const PORT = process.env.PORT || '50000'
app.listen(PORT, () => { console.log(`Server running in port: ${PORT}`) })