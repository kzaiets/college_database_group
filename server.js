// test
const e = require('express');
const express = require('express');
const mysql=require('mysql2');
const dotenv = require('dotenv')
dotenv.config()

//server
const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
});

//instance expression
const app = express();

//log
console.log('test');

//server
const port = process.env.PORT;

//Start server listening on the port
app.listen(port, () => {
  console.log(`listening on port ${port}`)
});


//json 
app.use(express.json());


//Using default error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    error: 'Internal server error'
  });
});

//Users accessing routes that are not defined
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not found'
  });
});


// API EXAMPLES

//defining variables to be passed to authorize procedure to make sure only authorized users perform action 
StudentAuthorized = 'Student'
TeacherAuthorized = 'Teacher'
AdminAuthorized = 'Admin'



// API for student enrolling to course
app.post('/enrol/:userid/:courseid/', function (request, response) {
    //Check if a user is authorized to perform an action
    connection.query(`CALL Authorize(${+request.params.userid}, '${StudentAuthorized}');`, (error, result) => {
      if (error) {
        console.log(error);
      }
      // Call the Authorize procedure
      const authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
      if (authorisation_response !== 'OK') {
        response.send(authorisation_response);
      }else{
    // Call the stored procedure and pass the necessary parameters received from the user
    // Plus sign converts the values to numbers
    connection.query(`CALL Enrol(${+request.params.courseid}, ${+request.params.userid});`, (error, result)=>{
        // Handle SQL errors
        if (error) {
           console.log(error)
        };
        // Get confirmation that enrollment was successful/unsuccessful from the database
        message = JSON.parse(JSON.stringify(result[0]))[0].Response
  
        // Send the message to the user
        response.send(message)
      });
   }
  });
});



// API for students to view available courses
app.get('/courses/:userid', function (request, response) {
   connection.query(`CALL Authorize(${+request.params.userid}, '${StudentAuthorized}');`, (error, result) => {
      if (error) {
        console.log(error);
      }
      // Call the Authorize procedure
      const authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
      if (authorisation_response !== 'OK') {
        response.send(authorisation_response);
      }else{
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
   }
 });
});




//API for admins to make courses available/unavailable
app.post('/courseavail/:userid/:courseid/:enabledisable', function (request, response) {
  //Check if a user is authorized to perform an action
  connection.query(`CALL Authorize(${+request.params.userid}, '${AdminAuthorized}');`, (error, result) => {
   if (error) {
     console.log(error);
   }
   // Call the Authorize procedure
   const authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
   if (authorisation_response !== 'OK') {
     response.send(authorisation_response);
   }else{
  // Call the Authorize procedure
      connection.query(`CALL ChangeAvailability(${+request.params.courseid}, ${+request.params.enabledisable});`, (error, result)=>{
      if (error) {
          console.log(error);
         }
   
      response.send(authorisation_response);
      });
     }
   });
});





//API for admins assigning teachers to courses
app.post('/assignteacher/:userid/:courseid/:teacherid', function (request, response) {
   //Check if a user is authorized to perform an action
   connection.query(`CALL Authorize(${+request.params.userid}, '${AdminAuthorized}');`, (error, result) => {
      if (error) {
        console.log(error);
      }
      // Call the Authorize procedur
      const authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
      if (authorisation_response !== 'OK') {
        response.send(authorisation_response);
      }else{
  // Call the Authorize procedure
   connection.query(`CALL AssignCourses(${+request.params.courseid}, ${+request.params.teacherid});`, (error, result)=>{
      if (error) {
         console.log(error);
       }
       response.send(authorisation_response);
     });
    }
   });
 });




//Teachers can fail or pass a student.
app.post('/authorisation/:userid/:courseid/:studentid/:markgiven', function (request, response) {
   //Check if a user is authorized to perform an action
   connection.query(`CALL Authorize(${+request.params.userid}, '${TeacherAuthorized}');`, (error, result) => {
    if (error) {
      console.log(error);
    }
    // Call the Authorize procedur
    authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
    if (authorisation_response !== 'OK') {
      response.send(authorisation_response);
    }else{
    connection.query(`CALL MarkStudents(${+request.params.courseid}, ${+request.params.studentid}, '${request.params.markgiven.toLowerCase()}');`, (error, result) => {
      if (error) {
        console.log(error);
      }
      message = JSON.parse(JSON.stringify(result[0]))[0].Response;
      response.send(message);
    });
   }
  });
});


 
