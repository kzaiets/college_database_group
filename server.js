// test
const express = require('express');
const mysql=require('mysql2');
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "mydb",
});

//instance expression
const app = express();

//log
console.log('test');

//server
const port = 3000; 

//Start server listening on the port
app.listen(port, () => {
  console.log(`listening on port ${port}`)
});


//json 
app.use(express.json());


// API EXAMPLES

// API for student enrolling to course
app.post('/enrol/:courseid/:studentid', function (request, response) {

    // Call the stored procedure and pass the necessary parameters received from the user
    // Plus sign converts the values to numbers
    connection.query(`CALL Enrol(${+request.params.courseid}, ${+request.params.studentid});`, (error, result)=>{
        // Handle SQL errors
        if (error) {
           console.log(error)
        };

        // Get confirmation that enrollment was successful/unsuccessful from the database
        message = JSON.parse(JSON.stringify(result[0]))[0].Response
  
        // Send the message to the user
        response.send(message)
   });
});

// API for students to view available courses
app.get('/courses', function (request, response) {
   
    // Call the stored procedure
    connection.query(`CALL ViewCourses`, (error, result)=>{
        // Handle SQL errors
        if (error) {
           console.log(error)
        };

        // Database returns number to indicate what was completed
        // Get the list of available courses sent out of the database from the json body
       message = result[0]

        // Send the message to the user
        response.send(message)
   });
});

//API for admins to make courses available/unavailable
app.post('/courseavail/:courseid/:enabledisable', function (request, response) {

  connection.query(`CALL ChangeAvailability(${+request.params.courseid}, ${+request.params.enabledisable});`, (error, result)=>{

      if (error) {
         console.log(error)
      };
      message = result[0]

      response.send(message)
    });    
});

//API for admins assigning teachers to courses
app.post('/assignteacher/:courseid/:teacherid', function (request, response) {

   connection.query(`CALL AssignCourses(${+request.params.courseid}, ${+request.params.teacherid});`, (error, result)=>{
 
       if (error) {
          console.log(error)
       };
       message = result[0]
 
       response.send(message)
     });    
 });

//Teachers can fail or pass a student.
 app.post('/mark/:courseid/:studentid/:markgiven', function (request, response) {

   connection.query(`CALL MarkStudents(${+request.params.courseid}, ${+request.params.studentid}, ${request.params.markgiven});`, (error, result)=>{
       
       if (error) {
          console.log(error)
       };

       
       message = JSON.parse(JSON.stringify(result[0]))[0].Response
 
     
       response.send(message)
      });
});