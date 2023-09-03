import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateAsToolsItemEntry } from "../shared/Validator";
import { marshall } from "@aws-sdk/util-dynamodb";
import { parseJSON } from "../shared/Utils";

export async function postSpaces(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {

    const item = parseJSON(event.body);
    //item.id = randomId
    validateAsToolsItemEntry(item)

    const result = await ddbClient.send(new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: marshall(item)
    }));

    return {
        statusCode: 201,
        body: event.body
    }
}