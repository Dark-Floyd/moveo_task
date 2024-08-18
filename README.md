# Moveo Project Management Task
A Node.js & Express.js Project containing:
- User Authentication: Secure user login and registration powered by AWS Cognito, including JWT-based authentication.
- Project Management: Full CRUD operations for managing projects. Each project includes a name, description, and owner.
- Task Management: Tasks can be created, updated, and tracked within projects. Each task has a title, description, status, and is linked to a specific project.
- Role-Based Access Control: Users have roles such as user or admin, which determine their access to certain API endpoints.
- Testing: The API is tested using Jest, ensuring that all key functionalities work as expected.
## Table of Contents
- [Features](#features)
- [Setup](#setup)
- [Usage](#usage)
- [Running Tests](#running-tests)
- [Output](#output)

## Features

- User Authentication system with AWS Cognito User Pool.
- CRUD operations for projects.
- CRUD operations for tasks within a project.
- Store data in Mongoose.

## Setup

1. Clone the repository(if you downloaded via zip file, skip this part):
   ```bash
   git https://github.com/Dark-Floyd/moveo_task.git
   cd task-management-api
2. Install the dependencies :
    ```bash
    npm install
3. Setup the environment variables by creating .env file :
    ```bash
    PORT=5000
    MONGO_URI=your_mongodb_uri
    AWS_REGION=your_aws_region
    AWS_COGNITO_USER_POOL_ID=your_cognito_user_pool_id
    AWS_COGNITO_CLIENT_ID=your_cognito_client_id
    JWT_SECRET=your_jwt_secret_key
4. Build the project(to avoid TypeScript issues):
    ```bash
    npm run build
    ```
5. Run The server:
    ```bash
    npm run dev
    ```

## Usage
When running the server, an authenticated user can use the endpoints(with a Token Bearer):
```api/auth/login``` - Authenticated user login endpoint (receives a token). 
```api/auth/register``` - Registration endpoint(not usable because of Cognito, optional if needed).

```api/projects``` - [POST] Creation of a new project.
```api/projects``` - [GET] Get all projects.
```api/projects/:id``` - [GET] Get project by ID.
```api/projects/:id``` - [PUT] Update project by ID.
```api/projects/:id``` - [DELETE] Delete project by ID.
```api/projects/:id/tasks``` - [GET] Get all tasks from project by ID.

```api/projects/:id/tasks``` - [POST] Create a task within a certain project.
```api/projects/:id/tasks/:id``` - [PUT] Update a task within a certain project.
```api/projects/:id/tasks/:id``` - [DELETE] Delete a task from a certain project.







## Running Tests
- authController.test.ts - Tests the login of a user.
    - ```returns 200 and a token for valid credentials``` - Regular login.
    - ```returns 401 for invalid credentials``` - Failed login.
    - ```handles newPasswordRequired challenge``` - Test to check the new password requirement from AWS(Something that I couldn't disable from some reason and I've solved it in the code).
- ```projectController.test.ts``` - Tests the Project routes.
    - ```creates a project and return 201 when authenticated``` - Testing the creation of a project.
    - ```returns 401 if user is not authenticated``` - Tests failure of a creation of a project without a token.
- ```projectDelete.test.ts``` - Tests deletion of a project(seperated for redundancy).
    - ```deletes a project and return 200 when authenticated``` - Testing a deletion of a project.
    - ```returns 404 if the project does not exist ``` - Testing a failure if project does not exist.
    - ``` should return 401 if user is not authenticated``` - Testing deletion with a user that is not authenticated.
- ```taskController.test.ts``` - Tests the tasks routes.
    - ```should create a task and return 201 ```  - creates a task.
    - ``` should return 404 if the project does not exist``` - Tests creation with project that doesn't exist.

## Output
Tested in Insomnia 9.3.3:
- ```api/projects``` [GET]
    ```[
	{
		"_id": "66c0c2172d9be11f45ced97e",
		"name": "My New Project",
		"description": "This is a test project.",
		"createdBy": "66c0c20e2d9be11f45ced97b",
		"createdAt": "2024-08-17T15:30:31.297Z",
		"updatedAt": "2024-08-17T15:30:31.297Z",
		"__v": 0
	},
	{
		"_id": "66c0c8886cb1e7765c3c65ca",
		"name": "My New Project2",
		"description": "This is a test project.",
		"createdBy": "66c0c20e2d9be11f45ced97b",
		"createdAt": "2024-08-17T15:58:00.378Z",
		"updatedAt": "2024-08-17T16:14:34.218Z",
		"__v": 0
	},
	{
		"_id": "66c1bf368a1a67d560cf9f23",
		"name": "My New Project!!!",
		"description": "This is a test project.",
		"createdBy": "66c0c20e2d9be11f45ced97b",
		"createdAt": "2024-08-18T09:30:30.812Z",
		"updatedAt": "2024-08-18T09:30:30.812Z",
		"__v": 0
	}
    ]

- ```api/projects``` - [POST]
    ```
    {
  "name": "My New Project!!!",
  "description": "This is a test project."
    }
    Response:
    {
	"name": "My New Project!!!",
	"description": "This is a test project.",
	"createdBy": "66c0c20e2d9be11f45ced97b",
	"_id": "66c1bf368a1a67d560cf9f23",
	"createdAt": "2024-08-18T09:30:30.812Z",
	"updatedAt": "2024-08-18T09:30:30.812Z",
	"__v": 0
    }
    ```
- ```api/projects/:id/tasks``` - [GET]
    ```
    [
	{
		"_id": "66c0c97d6cb1e7765c3c65d1",
		"title": "Design the landing page even harder!!!!",
		"description": "Create the UI/UX design for the landing page.",
		"status": "todo",
		"project": "66c0c8886cb1e7765c3c65ca",
		"createdBy": "66c0c20e2d9be11f45ced97b",
		"createdAt": "2024-08-17T16:02:05.952Z",
		"updatedAt": "2024-08-17T16:17:24.424Z",
		"__v": 0
	},
	{
		"_id": "66c0cba16cb1e7765c3c65d6",
		"title": "Design the landing page even harder",
		"description": "Create the UI/UX design for the landing page.",
		"status": "todo",
		"project": "66c0c8886cb1e7765c3c65ca",
		"createdBy": "66c0c20e2d9be11f45ced97b",
		"createdAt": "2024-08-17T16:11:13.626Z",
		"updatedAt": "2024-08-17T16:11:13.626Z",
		"__v": 0
	},
	{
		"_id": "66c1bf438a1a67d560cf9f2c",
		"title": "wowwwww",
		"description": "Create the UI/UX design for the landing page.",
		"status": "todo",
		"project": "66c0c8886cb1e7765c3c65ca",
		"createdBy": "66c0c20e2d9be11f45ced97b",
		"createdAt": "2024-08-18T09:30:43.227Z",
		"updatedAt": "2024-08-18T09:30:43.227Z",
		"__v": 0
	}
    ]
    ```
- ```api/projects/:id/tasks``` - [POST]
    ```
    {
  "title": "wowwwww",
  "description": "Create the UI/UX design for the landing page.",
  "status": "todo"
    }
    Response:
    {
	"title": "wowwwww",
	"description": "Create the UI/UX design for the landing page.",
	"status": "todo",
	"project": "66c0c8886cb1e7765c3c65ca",
	"createdBy": "66c0c20e2d9be11f45ced97b",
	"_id": "66c1c39ca4fe7396b99c7e2b",
	"createdAt": "2024-08-18T09:49:16.292Z",
	"updatedAt": "2024-08-18T09:49:16.292Z",
	"__v": 0
    }
    ```

