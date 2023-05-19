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
  database: process.env.DATABASE
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



// Variables to be passed to authorize procedure to make sure only authorized users perform action 
StudentAuthorized = 'Student'
TeacherAuthorized = 'Teacher'
AdminAuthorized = 'Admin'

//--------Error handling middleware---------------------------------------------------------------
//Error logging
const errorlog = (err, req, res, next) => {
  console.log( `error ${err.message}`) 
  next(err) 
};
//Users accessing routes that are not defined
const undefinedPathHandler= (req, res, next) => {
  const err = new Error('Not Found');
  res.status(404)
  res.send('Error: Invalid path')
  next(err)
};

  //Using default error handler
const defaultErrorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.send('Error: API not working')

  res.status(status).json({
    error: message
  });
};

// Socket hang up error handling
const socketHangUpHandler = (err, req, res, next) => {
  if (err.code === 'ECONNRESET') {
    console.error('Socket hang up');
    res.status(400).json({
      error: 'Socket hang up'
    });
  } else {
    next(err);
  }
};
//end of error handling middleware---------------------------------------------------------------

//--------APIs-------------------------------------------------------------------------------------

// API for student enrolling to course
app.post('/enrol/:userid/:courseid', function (request, response,next) {
  // try catch block to handle any errors that may occur
  try {
    //validation of input data type and to handle any empty fields
    if (isNaN(request.params.userid) || isNaN(request.params.courseid)) {
      response.send('Invalid input. User ID and course ID should be numbers.');
  
    return;}
    if (!request.params.userid || !request.params.courseid|| request.params.userid.trim() === '' || request.params.courseid.trim() === '' ) {
      response.send('One of the values are blank, please check.');
      return;
    }

    //Check if a user is authorized to perform an action
    // Call the Authorize procedure
    connection.query(`CALL Authorize(${+request.params.userid}, '${StudentAuthorized}');`, (error, result) => {
      if (error) {
        console.log(error);
        next(error);
      }
      const authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
      if (authorisation_response !== 'OK') {
        response.send(authorisation_response);
      }else{
        connection.query(`CALL CheckCourse(${+request.params.courseid});`, (error, result) => {
            if (error) {
                console.log(error);
                next(error);
              }
            coursecheck_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
            if (coursecheck_response !== 'OK') {
                response.send(coursecheck_response);
            }
            else{
    // Call the stored procedure and pass the necessary parameters received from the user
    connection.query(`CALL Enrol(${+request.params.courseid}, ${+request.params.userid});`, (error, result)=>{
        // Handle SQL errors
        if (error) {
           console.log(error)
           next(error);
        };
        // Get confirmation that enrollment was successful/unsuccessful from the database
        message = JSON.parse(JSON.stringify(result[0]))[0].Response
  
        // Send the message to the user
        response.send(message)
      });
    }
});
   }
  });
} catch (error) {
  console.log(error);
  response.send('API error, contact the system administrator.');
  next(error);
}
});



// API for students to view available courses
app.get('/courses/:userid', function (request, response,next) {
    try {
      //validation of input data type and to handle any empty fields
      if (isNaN(request.params.userid)) {
        response.send('Invalid input. User ID, should be number.');
    
      return;}
      if (!request.params.userid || request.params.userid.trim() === '' ) {
        response.send('One of the values are blank, please check.');
        return;
      }

   connection.query(`CALL Authorize(${+request.params.userid}, '${StudentAuthorized}');`, (error, result) => {
      if (error) {
        console.log(error);
        next(error);
      }
      //Check if a user is authorized to perform an action
      // Call the Authorize procedure
      const authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
      if (authorisation_response !== 'OK') {
        response.send(authorisation_response);
      }else{
    // Call the stored procedure to get list of courses
    connection.query(`CALL ViewCourses`, (error, result)=>{
        // Handle SQL errors
        if (error) {
           console.log(error)
           next(error);
        };

        // Get the list of available courses sent out of the database from the json body
       message = result[0]

        // Send the message to the user
        response.send(message)
      });
   }
 });
} catch (error) {
  console.log(error);
  response.send('API error, contact the system administrator.');
  next(error);
}
});


//API for admins to make courses available/unavailable
app.post('/courseavail/:userid/:courseid/:course_available', function (request, response,next) {
  try {
    //validation of input data type and to handle any empty fields
    if (isNaN(request.params.userid) || isNaN(request.params.courseid) || Number(request.params.course_available)) {
      response.send('Invalid input. User ID, course ID, should be numbers and available should be "enable" or "disable".');
  
    return;}
    if (!request.params.userid || !request.params.courseid || !request.params.course_available || request.params.userid.trim() === '' || request.params.courseid.trim() === '' || request.params.course_available.trim() === '' ) {
      response.send('One of the values are blank, please check.');
      return;
    }

  //Check if a user is authorized to perform an action
  connection.query(`CALL Authorize(${+request.params.userid}, '${AdminAuthorized}');`, (error, result) => {
   if (error) {
     console.log(error);
     next(error);
   }
   //Check if a user is authorized to perform an action
   // Call the Authorize procedure
   const authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
   if (authorisation_response !== 'OK') {
     response.send(authorisation_response);
   }else{
       connection.query(`CALL CheckCourse(${+request.params.courseid});`, (error, result) => {
        if (error) {
            console.log(error);
            next(error);
          }
        coursecheck_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
        if (coursecheck_response !== 'OK') {
            response.send(coursecheck_response);
        }
        else{
    // Call the stored procedure to enable/disable course
      connection.query(`CALL ChangeAvailability(${+request.params.courseid}, '${request.params.course_available.toLowerCase()}');`, (error, result)=>{
      if (error) {
          console.log(error);
          next(error);
         }
   
         message = JSON.parse(JSON.stringify(result[0]))[0].Response;
         response.send(message);
      });
    }
});
     }
   });
  } catch (error) {
    console.log(error);
    response.send('API error, contact the system administrator.');
    next(error);
  }
});





//API for admins assigning teachers to courses
app.post('/assignteacher/:userid/:courseid/:teacherid', function (request, response,next) {
   // try catch block to handle any errors that may occur
   try {
    //validation of input data type and to handle any empty fields
    if (isNaN(request.params.userid) || isNaN(request.params.courseid) || isNaN(request.params.teacherid)) {
      response.send('Invalid input. User ID, course ID, and teacher ID should be numbers.');
  
    return;}
    if (!request.params.userid || !request.params.courseid || !request.params.teacherid || request.params.userid.trim() === '' || request.params.courseid.trim() === '' || request.params.teacherid.trim() === '' ) {
      response.send('One of the values are blank, please check.');
      return;
    }
  
   //Check if a user is authorized to perform an action
   // Call the Authorize procedur
   connection.query(`CALL Authorize(${+request.params.userid}, '${AdminAuthorized}');`, (error, result) => {
      if (error) {
        console.log(error);
        next(error);
      }else{
        authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
      if (authorisation_response !== 'OK') {
        response.send(authorisation_response);
      }else{
        // Check if the course exists
        connection.query(`CALL CheckCourse(${+request.params.courseid});`, (error, result) => {
            if (error) {
                console.log(error);
                next(error);
              }else{
            coursecheck_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
            if (coursecheck_response !== 'OK') {
                response.send(coursecheck_response);
            }
            else{

  // Call the procedure to assign course to teacher
   connection.query(`CALL AssignCourses(${+request.params.courseid}, ${+request.params.teacherid});`, (error, result)=>{
      if (error) {
         console.log(error);
         next(error);
       }
       message = JSON.parse(JSON.stringify(result[0]))[0].Response;
       response.send(message);
     });
    }
  }
    });
    }
  }
   });
  } catch (error) {
    console.log(error);
    response.send('API error, contact the system administrator.');
    next(error);
  }
 });



//API for teachers to fail or pass a student.
app.post('/mark/:userid/:courseid/:studentid/:markgiven', function (request, response,next) {
  // try catch block to handle any errors that may occur
  try {
    //validation of input data type and to handle any empty fields
    if (isNaN(request.params.userid) || isNaN(request.params.courseid) || isNaN(request.params.studentid) || Number(request.params.markgiven)) {
      response.send('Invalid input. User ID, course ID, and student ID should be numbers and mark should be "pass" or "fail".');
  
    return;}
    if (!request.params.userid || !request.params.courseid || !request.params.studentid || !request.params.markgiven || request.params.userid.trim() === '' || request.params.courseid.trim() === '' || request.params.studentid.trim() === '' || request.params.markgiven.trim() === '') {
      response.send('One of the values are blank, please check.');
      return;
    }
  
   //Check if a user is authorized to perform an action
   // Call the Authorize procedure
   connection.query(`CALL Authorize(${+request.params.userid}, '${TeacherAuthorized}');`, (error, result) => {
    if (error) {
      console.log(error);
      next(error);
    }else{
    authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
    if (authorisation_response !== 'OK') {
      response.send(authorisation_response);
    }else{
        // Check if the course exists
        connection.query(`CALL CheckCourse(${+request.params.courseid});`, (error, result) => {
            if (error) {
                console.log(error);
                next(error);
              }else{
            coursecheck_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
    
            if (coursecheck_response !== 'OK') {
                response.send(coursecheck_response);
            }
            else{
                // Call the procedure to grade students
                connection.query(`CALL MarkStudents(${+request.params.courseid}, ${+request.params.studentid}, '${request.params.markgiven.toLowerCase()}');`, (error, result) => {
                    if (error) {
                      console.log(error);
                      next(error);
                    }else{
                    message = JSON.parse(JSON.stringify(result[0]))[0].Response;
                    response.send(message);
                    }
                  });
            }
          }

        });
      }
    }
   });
  } catch (error) {
    console.log(error);
    response.send('API error, contact the system administrator.');
    next(error);
  }
});
//end of APIs-------------------------------------------------------------------------------------

 //Error handling middleware
app.use(errorlog);
app.use(undefinedPathHandler);
app.use(socketHangUpHandler);
app.use(defaultErrorHandler);



 