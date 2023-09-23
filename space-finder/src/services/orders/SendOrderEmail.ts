import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateAsOrderItemEntry, validateAsToolsItemEntry } from "../shared/Validator";
import { marshall } from "@aws-sdk/util-dynamodb";
import { createRandomId, parseJSON } from "../shared/Utils";
import { SES } from "aws-sdk";
import { AWS_REGION, SES_EMAIL_FROM } from "../../../env";

export type ContactDetails = {
    name: string;
    email: string;
    message: string;
  };

  export async function  sendEmail({
    name,
    email,
    message,
  }: ContactDetails): Promise<APIGatewayProxyResult> {
    const ses = new SES({region: AWS_REGION});
    await ses.sendEmail(sendEmailParams({name, email, message})).promise();
    return {
        statusCode: 201,
        body: `{message: 'Email sent successfully 🎉🎉🎉'}`
    }
  }
  
  function sendEmailParams({name, email, message}: ContactDetails) {
    return {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: getHtmlContent({name, email, message}),
          },
          Text: {
            Charset: 'UTF-8',
            Data: getTextContent({name, email, message}),
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: `Email from example ses app.`,
        },
      },
      Source: SES_EMAIL_FROM,
    };
  }
  
  function getHtmlContent({name, email, message}: ContactDetails) {
    return `
      <html>
        <body>
          <h1>Received an Email. 📬</h1>
          <h2>Sent from: </h2>
          <ul>
            <li style="font-size:18px">👤 <b>${name}</b></li>
            <li style="font-size:18px">✉️ <b>${email}</b></li>
          </ul>
          <p style="font-size:18px">${message}</p>
        </body>
      </html> 
    `;
  }
  
  function getTextContent({name, email, message}: ContactDetails) {
    return `
      Received an Email. 📬
      Sent from:
          👤 ${name}
          ✉️ ${email}
      ${message}
    `;
  }
