import middy from '@middy/core';
import { sendResponse, sendError } from '../responses/index';
import { db } from '../services/db';
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from 'bcryptjs';

const createUser = async (event) => {
  const { name, email, password } = JSON.parse(event.body);
  if (!name || !email || !password) {
    return sendError(400, 'All fields are required');
  }

  try {
    const getUserCommand = new GetCommand({
      TableName: 'users',
      Key: { email }
    });
    const existingUser = await db.send(getUserCommand);

    if (existingUser.Item) {
      return sendError(400, 'Use another email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const putUserCommand = new PutCommand({
      TableName: 'users',
      Item: {
        email,
        name,
        password: hashedPassword
      }
    });

    await db.send(putUserCommand);
    return sendResponse({ message: 'User created successfully' });
  } catch (error) {
    return sendError(500, 'Internal Server Error');
  }
};

export const handler = middy(createUser);
