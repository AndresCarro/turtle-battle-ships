import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import { deleteFriendship } from "./db";
import { DeleteFriendsRequest, DeleteFriendsResponse } from "./types";

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
        body: JSON.stringify({ error: "Request body is required" }),
      };
    }

    const req: DeleteFriendsRequest = JSON.parse(event.body);

    if (!req.username) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "'username' in request body is required",
        }),
      };
    }

    if (!req.friendToDelete) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "'friendToDelete' in request body is required",
        }),
      };
    }

    await deleteFriendship(req.username, req.friendToDelete);

    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: "",
    };
  } catch (error) {
    console.error("Error deleting friend:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Not Found",
          message: error.message,
        }),
      };
    }

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
