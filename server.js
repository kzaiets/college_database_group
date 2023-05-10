// Setting up server and creating APIs

// Server setup
const express = require('express')
const app = express()
const port = 3000

//Create APIs
// Enable or disable the availability of a course
app.put('/courses/:courseId/availability/:isAvailable', checkAuthorization, (req, res) => {
  const { courseId, isAvailable } = req.params;
  const sql = 'UPDATE courses SET is_available = ? WHERE course_id = ?';
  connection.query(sql, [isAvailable, courseId], (error, results, fields) => {
    if (error) {
      console.error('Error:', error);
      res.status(500).send('Error');
    } else {
      res.status(200).send('Updated successfully');
    }
  });
});

// Assign one or more courses to a teacher
app.post('/teachers/:teacherId/courses', checkAuthorization, (req, res) => {
  const { teacherId } = req.params;
  const courseIds = req.body.courseIds;
  const values = courseIds.map((courseId) => `(${teacherId}, ${courseId})`).join(',');
  const sql = `INSERT INTO teacher_courses (teacher_id, course_id) VALUES ${values}`;
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error:', error);
      res.status(500).send('Error');
    } else {
      res.status(200).send('Courses assigned successfully');
    }
  });
});

// List all available courses with their teacher's name
app.get('/courses', (req, res) => {
  const sql = `SELECT courses.course_title, teachers.teacher_name FROM courses \
               INNER JOIN teacher_courses ON courses.course_id = teacher_courses.course_id \
               INNER JOIN teachers ON teacher_courses.teacher_id = teachers.teacher_id \
               WHERE courses.is_available = true`;
  connection.query(sql, (error, results, fields) => {
    if (error) {
      console.error('Error:', error);
      res.status(500).send('Error');
    } else {
      res.status(200).json(results);
    }
  });
});

// Enroll a student in a course
app.post('/students/:studentId/courses/:courseId', checkAuthorization, (req, res) => {
  const { studentId, courseId } = req.params;
  const sql = 'INSERT INTO student_courses (student_id, course_id) VALUES (?, ?)';
  connection.query(sql, [studentId, courseId], (error, results, fields) => {
    if (error) {
      console.error('Error:', error);
      res.status(500).send('Error');
    } else {
      res.status(200).send('Student enrolled successfully');
    }
  });
})





// Start server and listen on the port
app.listen(port, () => {
    console.log(`listening on port ${port}`)
});

