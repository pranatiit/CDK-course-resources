import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateAsOrderItemEntry, validateAsToolsItemEntry } from "../shared/Validator";
import { marshall } from "@aws-sdk/util-dynamodb";
import { createRandomId, parseJSON } from "../shared/Utils";

export async function createNewOrder(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {

    const item = parseJSON(event.body);
    item.id = 'or_' + createRandomId();
    item.date = new Date().getTime();
    item.deliveryStatus = 'PLACED';
    validateAsOrderItemEntry(item)

    const result = await ddbClient.send(new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: marshall(item)
    }));

    let response : any = {
        orderId : item.id,
        date: item.date,
        deliveryStatus: item.deliveryStatus
    }

    return {
        statusCode: 201,
        body: JSON.stringify(response)
    }
}
