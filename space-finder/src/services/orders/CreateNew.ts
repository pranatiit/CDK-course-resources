import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateAsOrderItemEntry, validateAsToolsItemEntry } from "../shared/Validator";
import { marshall } from "@aws-sdk/util-dynamodb";
import { createRandomId, parseJSON } from "../shared/Utils";
import { sendEmail} from "./SendOrderEmail";

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

    if(result){
        //send email
        let contact = {
            name: 'Hi',
            email: 'pranati.sahoo@outlook.com',
            message: 'Your order has been placed.'
        }

        const sendStatus = await sendEmail(contact);
    }

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
