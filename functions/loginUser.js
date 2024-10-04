import middy from '@middy/core';
import { sendResponse, sendError } from '../responses/index';
import { db } from '../services/db';
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const loginUser = async (event) => {
  const { email, password } = JSON.parse(event.body);
  if (!email || !password) {
    return sendError(400, 'All fields are required');
  }

  try {
    const getUserCommand = new GetCommand({
      TableName: 'users',
      Key: { email }
    });

    const user = await db.send(getUserCommand);

    if (!user.Item) {
      return sendError(400, 'Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.Item.password);
    if (!validPassword) {
      return sendError(400, 'Invalid credentials');
    }

    const token = jwt.sign({ email, name: user.Item.name }, process.env.JWT_SECRET, { expiresIn: '6h' });
    return sendResponse({ token });
  } catch (error) {
    return sendError(500, 'Internal Server Error');
  }
};

export const handler = middy(loginUser);
