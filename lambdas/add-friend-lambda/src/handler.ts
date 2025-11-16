import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { AddFriendRequest, AddFriendResponse } from "./types";
import { addFriend } from "./db";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
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

    const requestBody: AddFriendRequest = JSON.parse(event.body);

    if (!requestBody.userId || !requestBody.friendId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "userId and friendId are required",
        }),
      };
    }

    const friendship = await addFriend(requestBody);

    const response: AddFriendResponse = {
      success: true,
      message: "Friend request sent successfully",
      friendship: {
        id: friendship.id,
        userId: friendship.user_id,
        friendId: friendship.friend_id,
        status: friendship.status,
        createdAt: friendship.created_at.toISOString(),
      },
    };

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error adding friend:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    const statusCode = errorMessage.includes('already') ? 409 : 
                      errorMessage.includes('do not exist') ? 404 :
                      errorMessage.includes('Cannot add yourself') ? 400 :
                      errorMessage.includes('blocked') ? 403 : 500;

    return {
      statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: errorMessage,
      }),
    };
  }
};