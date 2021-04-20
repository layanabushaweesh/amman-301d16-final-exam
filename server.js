'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request

// Specify a directory for static resources
app.use(express.static('public'))

// define our method-override reference

// Set the view engine for server-side templating
app.set('view engine', 'pug')
// Use app cors
app.use(cors())

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/home' , renderHome)
app.post('/save' , saveCharacter)
app.get('/fav-charachter' , getFavCharachter)
app.get('/charachter/:charachter_id' , viewDetails)
app.put('/charachter/:charachter_id' , updateCharacter)
app.delete('/charachter/:charachter_id' , deleteCharacter)
// callback functions
function renderHome (req,res){
    const url ='https://thesimpsonsquoteapi.glitch.me/'
    superagent.get(url).then(dataFromApi =>{
        const charachters = dataFromApi.body.map(data =>
            new Character (data) )
            res.render( 'index' , { qoutes : charachters})

    })


}
function saveCharacter(req,res) {
    const {quote,character,image,characterDirection} =req.body
    const sql = 'INSERT INTO users (quote,character,image,characterDirection) VALUS ($1,$2,$3,$4)'
    const value =[quote,character,image,characterDirection]
    client.query(sql,value).then(() =>{
        res.redirect('/fav-charachter')

    })
}

function viewDetails (req , res) {
    const charaId =req.params.charachter_id
    const sql = 'SELECT * FROM users WHERE id =$1'
    const value =[charaId]
    client.query(sql,value).then((dataFromDB =>{
        res.render('detalies' , { detaliesChara : dataFromDB.rows})

    }))
    
}

 
function updateCharacter (req,res) {
    const {quote,character,image,characterDirection} =req.body
    const charaId = req.params.charachter_id
    const sql ='UPDATE users SET quote=$1,character=$2,imge=$3,characterDirection=$4 WHERE id=$5'
    const value =[quote,character,image,characterDirection,charaId]
    client.query(sql,value).then(()=>{
        res.redirect(`/charachter/${charaId}`)
    })

    
}

function getFavCharachter(req,res) {
    const sql ='SELECT * FROM user WHERE id=$1'
    const value=[]
    client.query(sql,value).then ((dataFromDB =>{
        res.render('fav', { favChara : dataFromDB.rows})
    }))
    
}
function deleteCharacter(req,res) {
    const chraId = req.params.charachter_id
    const value =[chraId]
    const sql = 'DELETE FROM user WHERE id=$1'
    client.query(sql,value).then(() =>{
        res.redirect('/charachter/:charachter_id')
    })

    
}
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --

// helper functions

function Character (data) {
   this.quote=data.quote
   this.character=data.character
   this.image =data.image
   this.characterDirection =data.characterDirection
}
// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
    );