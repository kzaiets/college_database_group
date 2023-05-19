const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv')
dotenv.config()

// Connecting to database
const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Instance expression
const app = express();

//log
console.log('test');

// Server
const port = process.env.PORT;

//Start server listening on the port
app.listen(port, () => {
    console.log(`listening on port ${port}`)
});


// json 
app.use(express.json());



// Variables to be passed to authorize procedure to make sure only authorized users perform action 
StudentAuthorized = 'Student'
TeacherAuthorized = 'Teacher'
AdminAuthorized = 'Admin'



// API for student enrolling to course
app.post('/enrol/:userid/:courseid/', function (request, response) {
    // Check if a user is authorized to perform an action
    // Call the Authorize procedure
    connection.query(`CALL Authorize(${+request.params.userid}, '${StudentAuthorized}');`, (error, result) => {
        if (error) {
            console.log(error);
        }
        const authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
        if (authorisation_response !== 'OK') {
            response.send(authorisation_response);
        } else {
            // Check if the course exists
            connection.query(`CALL CheckCourse(${+request.params.courseid});`, (error, result) => {
                if (error) {
                    console.log(error);
                }
                coursecheck_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
                if (coursecheck_response !== 'OK') {
                    response.send(coursecheck_response);
                } else {
                    // Call the stored procedure and pass the necessary parameters received from the user
                    connection.query(`CALL Enrol(${+request.params.courseid}, ${+request.params.userid});`, (error, result) => {
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
        }
    });
});



// API for students to view available courses
app.get('/courses/:userid', function (request, response) {
    connection.query(`CALL Authorize(${+request.params.userid}, '${StudentAuthorized}');`, (error, result) => {
        if (error) {
            console.log(error);
        }
        // Check if a user is authorized to perform an action
        // Call the Authorize procedure
        const authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
        if (authorisation_response !== 'OK') {
            response.send(authorisation_response);
        } else {
            // Call the stored procedure to get list of courses
            connection.query(`CALL ViewCourses`, (error, result) => {
                // Handle SQL errors
                if (error) {
                    console.log(error)
                };

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
        // Check if a user is authorized to perform an action
        // Call the Authorize procedure
        const authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
        if (authorisation_response !== 'OK') {
            response.send(authorisation_response);
        } else {
            // Check if the course exists
            connection.query(`CALL CheckCourse(${+request.params.courseid});`, (error, result) => {
                if (error) {
                    console.log(error);
                }
                coursecheck_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
                if (coursecheck_response !== 'OK') {
                    response.send(coursecheck_response);
                } else {
                    // Call the stored procedure to enable/disable course
                    connection.query(`CALL ChangeAvailability(${+request.params.courseid}, '${request.params.enabledisable.toLowerCase()}');`, (error, result) => {
                        if (error) {
                            console.log(error);
                        }
                        message = JSON.parse(JSON.stringify(result[0]))[0].Response;
                        response.send(message);
                    });
                }
            });
        }
    });
});



//API for admins assigning teachers to courses
app.post('/assignteacher/:userid/:courseid/:teacherid', function (request, response) {
    //Check if a user is authorized to perform an action
    // Call the Authorize procedur
    connection.query(`CALL Authorize(${+request.params.userid}, '${AdminAuthorized}');`, (error, result) => {
        if (error) {
            console.log(error);
        }
        const authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
        if (authorisation_response !== 'OK') {
            response.send(authorisation_response);
        } else {
            // Check if the course exists
            connection.query(`CALL CheckCourse(${+request.params.courseid});`, (error, result) => {
                if (error) {
                    console.log(error);
                }
                coursecheck_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
                if (coursecheck_response !== 'OK') {
                    response.send(coursecheck_response);
                } else {
                    // Call the procedure to assign course to teacher
                    connection.query(`CALL AssignCourses(${+request.params.courseid}, ${+request.params.teacherid});`, (error, result) => {
                        if (error) {
                            console.log(error);
                        }
                        message = JSON.parse(JSON.stringify(result[0]))[0].Response;
                        response.send(message);
                    });
                }
            });
        }
    });
});



//API for teachers to fail or pass a student.
app.post('/mark/:userid/:courseid/:studentid/:markgiven', function (request, response) {
    //Check if a user is authorized to perform an action
    // Call the Authorize procedure
    connection.query(`CALL Authorize(${+request.params.userid}, '${TeacherAuthorized}');`, (error, result) => {
        if (error) {
            console.log(error);
        }
        authorisation_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
        if (authorisation_response !== 'OK') {
            response.send(authorisation_response);
        } else {
            // Check if the course exists
            connection.query(`CALL CheckCourse(${+request.params.courseid});`, (error, result) => {
                if (error) {
                    console.log(error);
                }
                coursecheck_response = JSON.parse(JSON.stringify(result[0]))[0].Response;
                if (coursecheck_response !== 'OK') {
                    response.send(coursecheck_response);
                } else {
                    // Call the procedure to grade students
                    connection.query(`CALL MarkStudents(${+request.params.courseid}, ${+request.params.studentid}, '${request.params.markgiven.toLowerCase()}');`, (error, result) => {
                        if (error) {
                            console.log(error);
                        }
                        message = JSON.parse(JSON.stringify(result[0]))[0].Response;
                        response.send(message);
                    });
                }

            });
        }
    });
});