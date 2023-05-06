const e = require('express');
const mysql=require('mysql2');
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "mydb"
});

/*con.connect((err) => {
  if (err){
    console.log('Error connecting to mysql');
  }else{
    console.log('Connection established');
  }
});*/

module.exports = con;