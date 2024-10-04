import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Configuring the DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

// Using the DynamoDBDocumentClient to simplify operations
export const db = DynamoDBDocumentClient.from(client);
