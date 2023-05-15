-- Create SQL queries
-- 1. Admins should be able to enable or disable the availability of a course 
DROP PROCEDURE ChangeAvailability;
DELIMITER //
CREATE PROCEDURE ChangeAvailability(IN CourseID_provided INT, IN Availability_provided VARCHAR(10))
BEGIN
DECLARE TeacherCheck INT;
DECLARE EnableDisable INT;
DECLARE Response VARCHAR(100);
SET TeacherCheck = (SELECT TeacherID FROM courses WHERE CourseID = CourseID_provided);
-- Set the value to be entered to the database to 0 if user inputs "disable" and 1 if "enable"
SET EnableDisable = CASE Availability_provided
	WHEN 'disable' THEN 0
	WHEN 'enable' THEN 1
	ELSE NULL
    END;
-- Check if a user entered invalid value
IF EnableDisable IS NULL
THEN
SET Response = 'Please, either enter "enable" or "disable"';
-- Check if teacher already assigned when admin tries to enable the course
ELSE IF TeacherCheck = 0 AND EnableDisable = 1
THEN
SET Response = "Assign a teacher to the course first.";
ELSE
UPDATE courses
SET isAvailable = EnableDisable
WHERE CourseID = CourseID_provided;
-- Return success message
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
DECLARE Response VARCHAR(100);
DECLARE TeacherCheck INT;
SET TeacherCheck = (SELECT RoleID FROM users WHERE UserID = TeacherID_provided);
-- Check if a teacher exists in the system
IF NOT EXISTS (SELECT 1 FROM users WHERE UserID = TeacherID_provided) 
THEN
SET Response = "This teacher doesn't exist.";
-- Make sure a TeacherID provided belongs to a teacher
ELSE IF TeacherCheck != 2
THEN
SET Response = "This user is not a teacher";
ELSE
UPDATE courses
SET TeacherID = TeacherID_provided
WHERE CourseID = CourseID_provided;
-- Return success message
SET Response = "Success.";
END IF;
END IF;
SELECT Response;
END //

-- 3. Students can browse and list all the available courses and see the course title and course teacher’s name.
DROP PROCEDURE IF EXISTS ViewCourses; 
DELIMITER //
CREATE PROCEDURE ViewCourses()
BEGIN
-- Perform join
SELECT courses.Title 'Course Title', IFNULL(users.Name, 'Teacher Not Yet Assigned') AS `Teacher Name` 
FROM courses
LEFT JOIN users ON courses.TeacherID = users.UserID
-- Make sure students see only available courses
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
-- Return success message
		SET Response = "Enrolment successful.";
END IF;        
END IF;
SELECT Response;
END //

-- 5. Teachers can fail or pass a student.
DROP PROCEDURE MarkStudents;
DELIMITER //
CREATE PROCEDURE MarkStudents(IN CourseID_provided INT, IN StudentId_provided INT, IN Mark_provided VARCHAR(10))
BEGIN
DECLARE EnrolmentCheck INT;
DECLARE Mark_ INT;
DECLARE Response VARCHAR(100);
SET EnrolmentCheck = (SELECT EnrolmentID FROM enrolments WHERE CourseID = CourseID_provided AND UserID = StudentId_provided);
-- Set the value to be entered to the database to 0 if user inputs "fail" and 1 if "pass"
SET Mark_ = CASE Mark_provided
	WHEN 'fail' THEN 0
	WHEN 'pass' THEN 1
	ELSE NULL
    END;
-- check if enrollment exists
IF EnrolmentCheck IS NULL
	THEN SET Response = "The student does not have an enrolment for this course.";
-- Check if a user entered invalid value for a mark
ELSE IF Mark_ IS NULL
	THEN
    SET Response = 'Please, provide either "pass" or "fail" for grading';
ELSE
	UPDATE enrolments
	SET Mark = Mark_
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
-- Check if the user id exists in the system
IF NOT EXISTS (SELECT 1 FROM users WHERE UserID = UserID_provided)
THEN 
SET Response = "This user doesn't exist";
-- Check if the user role corresponds to user role needed to perform a certain action
ELSE IF RoleCheck != UserRole
THEN 
SET Response = "This user is not authorized to perform the action";
ELSE 
-- Return success message
SET Response = 'OK';
END IF;
END IF;
SELECT Response;
END //

-- Check if a course exists for apis that rely on user inputing a course
DROP PROCEDURE IF EXISTS CheckCourse;
DELIMITER //
CREATE PROCEDURE CheckCourse(IN CourseID_provided INT)
BEGIN
DECLARE CourseExists INT;
DECLARE Response VARCHAR(100);
SET CourseExists = (SELECT CourseID FROM courses WHERE CourseID = CourseID_provided);
-- Make sure a course exists in the system
IF CourseExists IS NULL
THEN
SET Response = "This course doesn't exist.";
ELSE 
-- Return success message
SET Response = "OK";
END IF;
SELECT Response;
END//