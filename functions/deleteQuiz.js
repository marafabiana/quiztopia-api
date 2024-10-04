import middy from '@middy/core';
import { sendResponse, sendError } from '../responses/index';
import { db } from '../services/db';
import { DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { validateToken } from '../middleware/auth';

const deleteQuiz = async (event) => {
  try {
    console.log('Delete quiz process started.');

    const quizId = event.pathParameters.id;

    if (!quizId) {
      console.error('Quiz ID is missing');
      return sendError(400, 'Quiz ID is required');
    }

    // Verify if the user is authenticated
    if (!event.requestContext || !event.requestContext.authorizer) {
      console.error('Authorization information is missing in deleteQuiz');
      return sendError(401, 'You must be logged in to delete a quiz');
    }

    const userEmail = event.requestContext.authorizer.principalId;
    console.log(`Authenticated user: ${userEmail} attempting to delete quiz with ID: ${quizId}`);

    // Verify if the quiz exists and if the user has permission to delete it
    const getQuizCommand = new ScanCommand({
      TableName: 'quizzes',
      FilterExpression: 'quizId = :quizId',
      ExpressionAttributeValues: {
        ':quizId': quizId
      }
    });

    const quizResult = await db.send(getQuizCommand);

    if (!quizResult.Items || quizResult.Items.length === 0) {
      console.error(`Quiz with ID ${quizId} not found`);
      return sendError(404, 'Quiz not found');
    }

    const quiz = quizResult.Items[0];

    // Verify if the logged-in user is the creator of the quiz
    if (quiz.createdBy !== userEmail) {
      console.error(`Unauthorized deletion attempt by user: ${userEmail} for quiz created by: ${quiz.createdBy}`);
      return sendError(403, 'You are not authorized to delete this quiz');
    }

    // Delete the quiz from the quizzes table
    const deleteQuizCommand = new DeleteCommand({
      TableName: 'quizzes',
      Key: {
        quizId: quizId
      }
    });

    await db.send(deleteQuizCommand);
    console.log(`Quiz with quizId: ${quizId} deleted successfully`);

    // Delete all questions associated with the quiz in the questions table
    const queryQuestionsCommand = new ScanCommand({
      TableName: 'questions',
      FilterExpression: 'quizId = :quizId',
      ExpressionAttributeValues: {
        ':quizId': quizId
      }
    });

    const questionsResult = await db.send(queryQuestionsCommand);

    if (questionsResult.Items && questionsResult.Items.length > 0) {
      for (const question of questionsResult.Items) {
        const deleteQuestionCommand = new DeleteCommand({
          TableName: 'questions',
          Key: {
            questionId: question.questionId
          }
        });
        await db.send(deleteQuestionCommand);
      }
      console.log(`All questions associated with quizId: ${quizId} have been deleted successfully`);
    }

    // Return a clear success message
    return sendResponse({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    console.error("Error deleting quiz and questions:", error);
    // Change the error message to indicate failure only in case of an unexpected error
    return sendError(500, 'Internal Server Error');
  }
};

// Export the handler with middy and apply token validation middleware
export const handler = middy(deleteQuiz).use(validateToken);
