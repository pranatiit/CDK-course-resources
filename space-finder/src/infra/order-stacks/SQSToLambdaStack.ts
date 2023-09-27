import { Construct } from 'constructs';
import { CfnOutput, Duration, Stack } from 'aws-cdk-lib'
import { Code, EventSourceMapping, Runtime, Tracing} from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { SqsToLambda } from '@aws-solutions-constructs/aws-sqs-lambda';

import { Effect, ManagedPolicy, Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

import { AWS_REGION } from '../../../env';
import { AwsIntegration, PassthroughBehavior } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SQSToLambdaStack extends Stack {

  public readonly orderEmailIntegration: AwsIntegration

    constructor(scope: Construct, id: string) {
        super(scope, id)

        const queue = new sqs.Queue(this, 'OrderEmailSqsQueue', {
          visibilityTimeout: Duration.minutes(1)
      });

        const lambdaRole = new Role(this, 'QueueConsumerFunctionRole', {
          assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
          managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaSQSQueueExecutionRole'), 
                            ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')]
        });

        const orderEmailLambdaFn = new NodejsFunction(this, 'OrderEmailLambda', {
          runtime: Runtime.NODEJS_18_X,
          handler: 'handler',
          entry: (join(__dirname, '..','..', 'services', 'orders', 'EmailHandler.ts')),
          tracing: Tracing.ACTIVE,
          role: lambdaRole,
          memorySize: 128,
          timeout: Duration.minutes(1)
      });

      const eventSourceMapping = new EventSourceMapping(this, 'QueueConsumerFunctionMySQSEvent', {
        target: orderEmailLambdaFn,
        batchSize: 10,
        eventSourceArn: queue.queueArn
      });


      orderEmailLambdaFn.addToRolePolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'ses:SendEmail',
            'ses:SendRawEmail',
            'ses:SendTemplatedEmail'
          ],
          resources: [ `arn:aws:ses:${AWS_REGION}:${
            Stack.of(this).account
          }:identity/*` ],
        })
      );

      const sendMessagesRole = new Role(this, "ApiRole", {
        assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
      });

      sendMessagesRole.attachInlinePolicy(new Policy(this, "SendMessagesPolicy", {
        statements: [
          new PolicyStatement({
            actions: ["sqs:SendMessage"],
            effect: Effect.ALLOW,
            resources: [queue.queueArn],
          }),
        ],
      })
    );

    new CfnOutput(this, 'QueueConsumerFunctionName', {
      value: orderEmailLambdaFn.functionName,
      description: 'QueueConsumerFunction function name'
    });

    new CfnOutput(this, 'SQSqueueName', {
      value: queue.queueName,
      description: 'SQS queue name'
    });

    new CfnOutput(this, 'SQSqueueARN', {
      value: queue.queueArn,
      description: 'SQS queue ARN'
    });

    new CfnOutput(this, 'SQSqueueURL', {
      value: queue.queueUrl,
      description: 'SQS queue URL'
    });

      this.orderEmailIntegration =  new AwsIntegration({
        service: "sqs",
        path: `${Stack.of(this).account}/${queue.queueName}`,
        options: {
          credentialsRole: sendMessagesRole,
          passthroughBehavior: PassthroughBehavior.NEVER,
          requestParameters: {
            "integration.request.header.Content-Type": `'application/x-www-form-urlencoded'`,
          },
          requestTemplates: {
            "application/json": "Action=SendMessage&MessageBody=$util.urlEncode(\"$input.body\")",
          },
          integrationResponses: [
            {
              statusCode: "200",
              responseTemplates: { "application/json": `{"success": true}` }
            },
            {
              statusCode: "500",
              responseTemplates: { "application/json": `{"success": false}` },
              selectionPattern: "[45]\\d{2}"
            }
          ],
        }
      })

    }
}