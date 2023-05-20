# Installation
To install this project, follow these steps:

1. Clone this repository to your local machine by running

```
git clone https://github.com/kzaiets/college_database_group.git
```

2. Navigate to the root directory of the project in your terminal.
3. Install all the required dependencies by running

```
npm install
```
# Using the Server
## Set up .env document
Create a .env file in the same place as the server.js file and use the below template to replace with login details for your database server. The port and host provided will be the port you want to run the server on.

```
DATABASE_HOST = "localhost"
DATABASE_USER = "root"
DATABASE_PASSWORD = "password"
DATABASE = "mydb"
PORT = 3000
```

## Running the server
If you want to start the server, navigate to the folder containing the files and run

```
npm start
```

# Testing the application via Postman
## API endpoints
API for student enrolling to course
```
/enrol/:userid/:courseid
```
API for students to view available courses
```
/courses/:userid
```
API for admins to make courses available/unavailable

course_available should be "enable" or "disable"
```
/courseavail/:userid/:courseid/:course_available
```
API for admins assigning teachers to courses
```
/assignteacher/:userid/:courseid/:teacherid
```
API for teachers to fail or pass a student

markgiven should be "pass" or "fail"
```
/mark/:userid/:courseid/:studentid/:markgiven
```
