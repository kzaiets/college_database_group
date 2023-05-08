--Create SQL queries
-- 1. Admins should be able to enable or disable the availability of a course 
DELIMITER //
CREATE PROCEDURE ChangeAvailability(IN CourseID_provided INT, IN Availability_provided INT)
BEGIN
UPDATE courses
SET isAvailable = Availability_provided
WHERE CourseID = CourseID_provided;
END //

-- 2. Admins should be able to assign one or more courses to a teacher
DELIMITER //
CREATE PROCEDURE AssignCourses(IN CourseID_provided INT, IN TeacherID_provided INT)
BEGIN
UPDATE courses
SET TeacherID = TeacherID_provided
WHERE CourseID = CourseID_provided;
END //

-- 3. Students can browse and list all the available courses and see the course title and course teacher’s name.
DELIMITER //
CREATE PROCEDURE ViewCourses()
BEGIN
SELECT courses.Title 'Course Title', IFNULL(users.Name, 'Teacher Not Yet Assigned') AS `Teacher Name` 
FROM courses
LEFT JOIN users ON courses.TeacherID = users.UserID
WHERE isAvailable = 1;
END // 

-- 4. Students can enrol in a course. Students should not be able to enrol in a course more than once at each time. 

-- 5. Teachers can fail or pass a student.
DELIMITER //
CREATE PROCEDURE MarkStudents(IN CourseID_provided INT, IN StudentId_provided INT, IN Mark_provided VARCHAR(4))
BEGIN
DECLARE EnrolmentCheck INT;
DECLARE Response VARCHAR(100);
-- check if enrollment exists
SET EnrolmentCheck = (SELECT EnrolmentID FROM enrolments WHERE CourseID = CourseID_provided AND UserID = StudentId_provided);
IF EnrolmentCheck IS NULL
-- If enrollment doesn't exist, return error message
	THEN 
    SET Response = "The student does not have an enrolment for this course.";
-- Options for mark are Pass or Fail
ELSE IF Mark_provided = "Pass"
	THEN
	UPDATE enrolments
	SET Mark = 1
	WHERE CourseID = CourseID_provided AND UserID = StudentId_provided;
-- Return success message
    SET Response = "Grading successful.";
ELSE
	UPDATE enrolments
	SET Mark = 0
	WHERE CourseID = CourseID_provided AND UserID = StudentId_provided;
-- Return success message
    SET Response = "Grading successful.";
END IF;
END IF;
SELECT Response;
END //
