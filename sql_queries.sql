--Create SQL queries
-- 1. Admins should be able to enable or disable the availability of a course 
-- 2. Admins should be able to assign one or more courses to a teacher
-- 3. Students can browse and list all the available courses and see the course title and course teacher’s name.
SELECT courses.Title 'Course Title', IFNULL(users.Name, 'Teacher Not Yet Assigned') AS `Teacher Name` 
FROM courses
LEFT JOIN users ON courses.TeacherID = users.UserID
WHERE isAvailable = 1;

-- 4. Students can enrol in a course. Students should not be able to enrol in a course more than once at each time. 
-- 5. Teachers can fail or pass a student.