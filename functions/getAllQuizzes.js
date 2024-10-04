import middy from '@middy/core';
import { sendResponse, sendError } from '../responses/index';
import { db } from '../services/db';
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { validateToken } from '../middleware/auth';

const getAllQuizzes = async (event) => {
  try {
    // Scan the quizzes table
    const scanCommand = new ScanCommand({
      TableName: 'quizzes',
    });

    const result = await db.send(scanCommand);

    // Check if any quiz was found
    if (!result.Items || result.Items.length === 0) {
      return sendError(404, 'No quizzes found');
    }

    // Create a list of the found quizzes containing only the desired fields (quizId, title, createdBy)
    const quizzes = result.Items.map(item => ({
      quizId: item.quizId,
      title: item.title,
      createdBy: item.createdBy,
    }));

    // Respond with the list of quizzes
    return sendResponse({
      success: true,
      quizzes
    });

  } catch (error) {
    console.error("Error retrieving quizzes:", error);
    return sendError(500, 'Internal Server Error');
  }
};

// Export the handler with middy and apply the token validation middleware
export const handler = middy(getAllQuizzes).use(validateToken);
