import middy from '@middy/core';
import { sendResponse, sendError } from '../responses/index';
import { db } from '../services/db';
import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { validateToken } from '../middleware/auth';

const getQuizQuestions = async (event) => {
  const quizId = event.pathParameters.id;

  if (!quizId) {
    return sendError(400, 'Quiz ID is required');
  }

  try {
    console.log(`Fetching questions for quizId: ${quizId}`);

    // Primeiro, verificar se o quiz existe na tabela quizzes
    const getQuizCommand = new GetCommand({
      TableName: 'quizzes',
      Key: {
        quizId: quizId
      }
    });

    const quizResult = await db.send(getQuizCommand);

    if (!quizResult.Item) {
      console.error(`Quiz with ID ${quizId} not found`);
      return sendError(404, 'Quiz not found');
    }

    // Fazer um scan na tabela de perguntas e filtrar pelo quizId fornecido
    const scanCommand = new ScanCommand({
      TableName: 'questions',
      FilterExpression: 'quizId = :quizId',
      ExpressionAttributeValues: {
        ':quizId': quizId
      }
    });

    const result = await db.send(scanCommand);

    // Verificar se alguma pergunta foi encontrada
    if (!result.Items || result.Items.length === 0) {
      console.error(`No questions found for quizId: ${quizId}`);
      return sendError(404, 'No questions found for this quiz');
    }

    console.log(`Questions found for quizId ${quizId}:`, result.Items);

    return sendResponse({
      success: true,
      questions: result.Items
    });

  } catch (error) {
    console.error("Error retrieving questions for the quiz:", error);
    return sendError(500, 'Internal Server Error');
  }
};

// Exportar o handler com middy e aplicar o middleware de validação do token
export const handler = middy(getQuizQuestions).use(validateToken);
