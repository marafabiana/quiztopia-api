import middy from "@middy/core";
import { sendResponse, sendError } from "../responses/index";
import { db } from "../services/db";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { validateToken } from "../middleware/auth";

const addQuestionToQuiz = async (event) => {
  const quizId = event.pathParameters.id;
  const { question, answer, coordinates } = JSON.parse(event.body);

  // Check if all fields are filled
  if (
    !quizId ||
    !question ||
    !answer ||
    !coordinates ||
    !coordinates.latitude ||
    !coordinates.longitude
  ) {
    return sendError(400, "All fields must be filled");
  }

  try {
    console.log(`Checking if quiz exists with quizId: ${quizId}`);

    // First, fetch the existing quiz to ensure it exists
    const getQuizCommand = new GetCommand({
      TableName: "quizzes",
      Key: {
        quizId: quizId,
      },
    });

    const quizResult = await db.send(getQuizCommand);

    if (!quizResult.Item) {
      console.error(`Quiz with ID ${quizId} not found`);
      return sendError(404, "Quiz not found");
    }

    const quiz = quizResult.Item;

    // Check if the authenticated user is the creator of the quiz
    if (!event.requestContext || !event.requestContext.authorizer) {
      console.error(
        "Authorization information is missing in addQuestionToQuiz"
      );
      return sendError(
        401,
        "You must be logged in to add a question to a quiz"
      );
    }

    const userEmail = event.requestContext.authorizer.principalId;

    if (quiz.createdBy !== userEmail) {
      console.error(
        `Unauthorized addition attempt by user: ${userEmail} for quiz created by: ${quiz.createdBy}`
      );
      return sendError(
        403,
        "You are not authorized to add a question to this quiz"
      );
    }

    // Prepare new question
    const questionId = uuidv4();
    const newQuestion = {
      questionId,
      quizId, // Relate the question to the corresponding quiz
      question,
      answer,
      coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
    };

    // Save the new question in the questions table
    const putQuestionCommand = new PutCommand({
      TableName: "questions",
      Item: newQuestion,
    });

    await db.send(putQuestionCommand);

    console.log(`New question added with ID: ${questionId}`);

    // Return success
    return sendResponse({
      success: true,
      question: newQuestion,
    });
  } catch (error) {
    console.error("Error adding question to quiz:", error);
    return sendError(500, "Internal Server Error");
  }
};

export const handler = middy(addQuestionToQuiz).use(validateToken);
