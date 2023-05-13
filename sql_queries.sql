-- Create SQL queries
-- 1. Admins should be able to enable or disable the availability of a course 
DROP PROCEDURE ChangeAvailability;
DELIMITER //
CREATE PROCEDURE ChangeAvailability(IN CourseID_provided INT, IN Availability_provided INT)
BEGIN
DECLARE CourseExists INT;
DECLARE TeacherCheck INT;
DECLARE Response VARCHAR(100);
SET CourseExists = (SELECT CourseID FROM courses WHERE CourseID = CourseID_provided);
SET TeacherCheck = (SELECT TeacherID FROM courses WHERE CourseID = CourseID_provided);
IF CourseExists IS NULL
THEN
SET Response = "This course doesn't exist.";
ELSE IF TeacherCheck = 0 AND Availability_provided = 1
THEN
SET Response = "Assign a teacher to the course first.";
ELSE
UPDATE courses
SET isAvailable = Availability_provided
WHERE CourseID = CourseID_provided;
SET Response = "Success!";
END IF;
END IF;
SELECT Response;
END //

-- 2. Admins should be able to assign one or more courses to a teacher
DROP PROCEDURE IF EXISTS AssignCourses; 
DELIMITER //
CREATE PROCEDURE AssignCourses(IN CourseID_provided INT, IN TeacherID_provided INT)
BEGIN
UPDATE courses
SET TeacherID = TeacherID_provided
WHERE CourseID = CourseID_provided;
END //

-- 3. Students can browse and list all the available courses and see the course title and course teacher’s name.
DROP PROCEDURE IF EXISTS ViewCourses; 
DELIMITER //
CREATE PROCEDURE ViewCourses()
BEGIN
SELECT courses.Title 'Course Title', IFNULL(users.Name, 'Teacher Not Yet Assigned') AS `Teacher Name` 
FROM courses
LEFT JOIN users ON courses.TeacherID = users.UserID
WHERE isAvailable = 1;
END // 

-- 4. Students can enrol in a course. Students should not be able to enrol in a course more than once at each time.
DROP PROCEDURE IF EXISTS Enrol; 
DELIMITER //
CREATE PROCEDURE Enrol(IN CourseID_provided INT, IN StudentId_provided INT)
BEGIN
DECLARE EnrolmentExists INT;
DECLARE Response VARCHAR(100);
SET EnrolmentExists = (SELECT EnrolmentID FROM enrolments WHERE CourseID = CourseID_provided AND UserID = StudentId_provided);
-- Make sure a student can't enrol more then once
IF EnrolmentExists IS NOT NULL
	THEN 
    SET Response = "The student is already enrolled.";
ELSE
	INSERT INTO enrolments (CourseId, UserId)
    VALUES (CourseID_provided, StudentId_provided);
-- Check if enrollment successfully generated
		IF ROW_COUNT() > 0
        THEN
		SET Response = "Enrolment successful.";
END IF;        
END IF;
SELECT Response;
END //

-- 5. Teachers can fail or pass a student.
DROP PROCEDURE IF EXISTS MarkStudents; 
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
ELSE IF Mark_provided = "pass"
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

-- Ensure only the authorized access can perform an action.
DROP PROCEDURE IF EXISTS Authorize;
DELIMITER //
CREATE PROCEDURE Authorize(IN UserID_provided INT, IN Role_provided VARCHAR(20))
BEGIN
DECLARE UserCheck INT;
DECLARE UserRole INT;
DECLARE RoleCheck INT;
DECLARE Response VARCHAR(100);
SET UserCheck = (SELECT UserID FROM users WHERE UserID = UserID_provided);
SET UserRole = (SELECT RoleID FROM roles WHERE Role = Role_provided);
SET RoleCheck = (SELECT RoleID FROM users WHERE UserID = UserID_provided);
IF NOT EXISTS (SELECT 1 FROM users WHERE UserID = UserID_provided)
THEN 
SET Response = "This user doesn't exist";
ELSE IF RoleCheck != UserRole
THEN 
SET Response = "This user is not authorized to perform the action";
ELSE 
SET Response = 'OK';
END IF;
END IF;
SELECT Response;
END //
