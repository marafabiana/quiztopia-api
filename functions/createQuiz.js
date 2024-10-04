import middy from '@middy/core';
import { sendResponse, sendError } from '../responses/index';
import { db } from '../services/db';
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { validateToken } from '../middleware/auth';

const createQuiz = async (event) => {
  const { title } = JSON.parse(event.body);
  if (!title) {
    return sendError(400, 'Quiz title is required');
  }

  try {
    const quizId = uuidv4();

    const putQuizCommand = new PutCommand({
      TableName: 'quizzes',
      Item: {
        quizId,               // Partition Key
        itemType: 'quiz',     // Sort Key
        title,
        createdBy: event.requestContext.authorizer.principalId // Extracted from validateToken middleware
      }
    });

    await db.send(putQuizCommand);
    return sendResponse({ quizId, title });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return sendError(500, 'Internal Server Error');
  }
};

export const handler = middy(createQuiz).use(validateToken);
