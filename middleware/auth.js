import jwt from 'jsonwebtoken';
import { sendError } from '../responses/index';

export const validateToken = {
  before: async (request) => {
    try {
      console.log('Authorization validation started');

      const authHeader = request.event.headers.Authorization || request.event.headers.authorization;

      if (!authHeader) {
        console.error('Authorization header is missing');
        request.response = sendError(401, 'You must be logged in to perform this action');
        return;  // Stop execution
      }

      console.log('Authorization header received:', authHeader);

      const token = authHeader.replace('Bearer ', '').trim();
      if (!token) {
        console.error('Token is missing after extracting from Authorization header');
        request.response = sendError(401, 'You must be logged in to perform this action');
        return;  // Stop execution
      }

      console.log('Token extracted successfully:', token);

      // Verify the JWT token using JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);

      request.event.requestContext = {
        authorizer: {
          principalId: decoded.email,
          name: decoded.name
        }
      };

      console.log('User authenticated successfully:', decoded.email);
      
    } catch (error) {
      console.error("Unauthorized access attempt:", error.message);
      request.response = sendError(401, 'You must be logged in to perform this action');
      return;  // Stop execution
    }
  }
};
