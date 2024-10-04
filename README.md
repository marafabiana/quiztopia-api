# Quiztopia API

## 1. Create a user
#### Method: POST
**URL**: https://otoh5vl857.execute-api.eu-north-1.amazonaws.com/auth/register

**Description**: Allows users to register by providing a name, email, and password. The endpoint ensures that each email is unique.

Request Body Example:
```
json
{
    "name": "John Doe",
    "email": "john@doe.com",
    "password": "test123"
    
}
```
## 2. User login
#### Method: POST
**URL**: https://otoh5vl857.execute-api.eu-north-1.amazonaws.com/auth/login

**Description**: Authenticates a user by validating their email and password, and returns a JSON Web Token (JWT) for authorized actions.

Request Body Example:
```
json
{
    "email": "john@doe.com",
    "password": "test123" 
}
```
## 3. Create a quiz
#### Method: POST
**URL**: https://otoh5vl857.execute-api.eu-north-1.amazonaws.com/quiz

**Description**: Enables a logged-in user to create a new quiz. The user must provide a quiz title, and only authenticated users can create quizzes.

Request Body Example:
```
json
{
    "title": "Culture and Attractions in Gothenburg"
}
```

## 4. Add question to quiz
#### Method: POST
**URL**: https://otoh5vl857.execute-api.eu-north-1.amazonaws.com/quiz/{id}/question

**Description**: Allows the creator of a quiz to add questions to it. The request must include a question, answer, and coordinates (latitude and longitude).

Request Body Example:
```
{
    "question": "Which Gothenburg museum is known for its extensive collection of Nordic art?",
    "answer": "Gothenburg Museum of Art",
    "coordinates":{
        "latitude": 57.6965,
        "longitude": 11.9805
    }
}
```

## 5. Get all quizzes
#### Method: GET
**URL**: https://otoh5vl857.execute-api.eu-north-1.amazonaws.com/quizzes

**Description**: Returns a list of all available quizzes, including their titles and creators. Requires the user to be logged in to access this information.

## 6. Get quiz questions
#### Method: GET
**URL**: https://otoh5vl857.execute-api.eu-north-1.amazonaws.com/quiz/{id}/questions

**Description**: Retrieves all questions for a specific quiz based on the provided quiz ID. Only logged-in users can view the questions.

## 7. Delete a quiz
#### Method: DEL
**URL**: https://otoh5vl857.execute-api.eu-north-1.amazonaws.com/quiz/{id}

**Description**: Allows a logged-in user to delete a quiz they created. Only the quiz owner has permission to delete it, ensuring that quizzes cannot be deleted by unauthorized users.
