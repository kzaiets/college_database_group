//packages
const con = require('./connection.js');
const express = require('express');
const api = require('./api.js');


//instance expression
const app = express();

//log
console.log('test');

//server
const port = 3000; 

//json 
app.use(express.json());


//------------------API section: composed of 4 endpoints (get,post,put,delete)------------------
const apihandler = new api(app,con);
//1. get_endpoint
apihandler.getEndpoint("SELECT * FROM users");
//2. post_endpoint
apihandler.postEndpoint("INSERT INTO users SET ?");
//3. put_endpoint
apihandler.putEndpoint("Update users SET Name = ? WHERE UserID = ?");
//4. delete_endpoint
apihandler.deleteEndpoint("DELETE FROM users WHERE UserID = ?");
//-----------------------------------------------------------------------------------------------



//Start server listening on the port
app.listen(port, () => {
  console.log(`listening on port ${port}`)
});
