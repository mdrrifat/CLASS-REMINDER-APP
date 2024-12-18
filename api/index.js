const express= require('express');
const bodyParser= require('body-parser');
const mongoose= require('mongoose');

const app= express();
const port=3000;
const cors= require('cors');

app.use(cors());

app.use(bodyParser.urlencoded({ extended:false}));

app.use(bodyParser.json());




app.listen(port,()=>{
    console.log("server listening on port 3000");
});