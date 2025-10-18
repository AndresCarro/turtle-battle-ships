import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { CreateUserRequest, CreateUserResponse } from "./types";
import { createUser } from "./db";

/**
 * Lambda handler function to create a new user
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Request body is required",
        }),
      };
    }

    const requestBody: CreateUserRequest = JSON.parse(event.body);

    // Validate required fields
    if (!requestBody.username) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Username is required",
        }),
      };
    }

    const user = await createUser(requestBody.username);

    const response: CreateUserResponse = {
      id: user.id.toString(),
      username: user.name,
      totalGames: user.totalGames,
      totalWins: user.totalWins,
    };

    console.log("User created successfully:", response);

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error creating user:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
