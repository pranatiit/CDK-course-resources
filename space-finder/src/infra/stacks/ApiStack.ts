import { Stack, StackProps } from 'aws-cdk-lib'
import { AuthorizationType, AwsIntegration, CognitoUserPoolsAuthorizer, Cors, JsonSchemaType, LambdaIntegration, MethodOptions, ResourceOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { AuthorizationToken } from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

interface ApiStackProps extends StackProps {
    spacesLambdaIntegration: LambdaIntegration,
    custLambdaIntegration: LambdaIntegration,
    orderLambdaIntegration: LambdaIntegration,
    orderSQSIntegration: AwsIntegration
    userPool: IUserPool;
}

export class ApiStack extends Stack {

    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const api = new RestApi(this, 'ToolPartsApi');

        const authorizer = new CognitoUserPoolsAuthorizer(this, 'ToolPartsApiAuthorizer', {
            cognitoUserPools:[props.userPool],
            identitySource: 'method.request.header.Authorization'
        });
        authorizer._attachToApi(api);

        const optionsWithAuth: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.authorizerId
            }
        }

        const optionsWithCors: ResourceOptions = {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS
            }
        }

        const spacesResource = api.root.addResource('toolparts', optionsWithCors);
        spacesResource.addMethod('GET', props.spacesLambdaIntegration, optionsWithAuth);
        spacesResource.addMethod('POST', props.spacesLambdaIntegration,optionsWithAuth);
        spacesResource.addMethod('PUT', props.spacesLambdaIntegration, optionsWithAuth);
        spacesResource.addMethod('DELETE', props.spacesLambdaIntegration, optionsWithAuth);

        
        const custResource = api.root.addResource('customer', optionsWithCors);
        custResource.addMethod('GET', props.custLambdaIntegration, optionsWithAuth);
        custResource.addMethod('POST', props.custLambdaIntegration,optionsWithAuth);
        custResource.addMethod('PUT', props.custLambdaIntegration, optionsWithAuth);
        custResource.addMethod('DELETE', props.custLambdaIntegration, optionsWithAuth);

        const orderResource = api.root.addResource('orders', optionsWithCors);
        orderResource.addMethod('GET', props.orderLambdaIntegration, optionsWithAuth);
        orderResource.addMethod('POST', props.orderLambdaIntegration,optionsWithAuth);
        orderResource.addMethod('PUT', props.orderLambdaIntegration, optionsWithAuth);
        orderResource.addMethod('DELETE', props.orderLambdaIntegration, optionsWithAuth);

        const inputModel = api.addModel('InputModel', {
            contentType: 'application/json',
            schema: {
              type: JsonSchemaType.OBJECT,
              properties: {
                version: { type: JsonSchemaType.STRING, enum: [ "1.0.0" ] },
                name: { type: JsonSchemaType.STRING },
                email: { type: JsonSchemaType.STRING, pattern: "^\\S+@\\S+\\.\\S+$" }
              },
              required: ["body", "name", "email"],
              additionalProperties: false
            }
          })

        const optionsWithEmailAuth: MethodOptions = {
            requestModels: { 'application/json': inputModel },
            requestValidatorOptions: { validateRequestBody: true },
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.authorizerId
            }
        }

        const optionsWithAuthSQS: MethodOptions = {
            methodResponses: [ { statusCode: '200'}, { statusCode: '500'} ],
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.authorizerId
            }
        }
        
        const emailResource = api.root.addResource('orderemail', optionsWithCors);
        emailResource.addMethod('POST', props.orderSQSIntegration, optionsWithAuthSQS);

    }
}