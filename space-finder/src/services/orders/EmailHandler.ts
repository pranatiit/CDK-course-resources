import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { JsonError, MissingFieldError } from "../shared/Validator";
import { addCorsHeader } from "../shared/Utils";
import { SES } from "aws-sdk";
import { AWS_REGION } from "../../../env";

async function handler(event: any, context: Context): Promise<APIGatewayProxyResult> {

    let response: APIGatewayProxyResult;
    console.log('event 👉', JSON.stringify(event.Records[0]));

    try {
      const promises = event.Records.map(async (record) => {

        const ses = new SES({region: AWS_REGION});
        const input = JSON.parse(record.body);
        return ses.sendEmail(createSesParams(input)).promise();
      });
      await Promise.all(promises);
      return {
        statusCode: 200,
        body: 'SUCCESS'
      }
    } catch (error) {
      console.log("ERROR is: ", error);
      return {
        statusCode: 200,
        body: 'FAIL'
      }
    }
}

  
export function createSesParams(data): SES.SendEmailRequest {
  console.log('event data 👉', JSON.stringify(data));
      return {
          Source: "ashok.cdma@gmail.com",
          Destination: { ToAddresses: [data.email] },
          Message: {
            Subject: { Data: "Test email" },
            Body: {
              Html: { Data: createHTML(data) },
              Text: { Data: createText(data) },
            },
          },
        };
  }
  
  
  export function createHTML(data: any) {
      const content = `
      <mjml>
        <mj-body>
          <mj-section>
            <mj-column>
              <mj-text>
                Hello {{name}}, thanks for stopping by!
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>`;
    
      return content;
  }
  
  export function createText(data: any) {
      return "Hello, thanks for stopping by!";
  }

export { handler }