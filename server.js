//packages
const con = require('./connection.js');
const express = require('express');

//instance expression
const app = express();

//log
console.log('test');

//server
const port = 3000; 

//json 
app.use(express.json());

//API
app.get('/' , (req, res) => {
  con.query("SELECT * FROM users", (err, result)=>{
    if (err){
      res.send('error');
    }else{
      res.send(result);
    }
  });
});

app.post('/' , (req, res) => {
  const data = req.body;
  con.query("INSERT INTO users SET ?",data, (err, result)=>{
    if (err){
      res.send('error');
    }else{
      res.send(result);
    }
  } ); 
})



//Start server listening on the port
app.listen(port, () => {
  console.log(`listening on port ${port}`)
});
