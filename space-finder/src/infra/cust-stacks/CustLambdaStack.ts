import { Duration, Stack, StackProps } from 'aws-cdk-lib'
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Tracing} from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

interface CustLambdaStackProps extends StackProps {
    customerTable: ITable
}

export class CustLambdaStack extends Stack {

    public readonly custLambdaIntegration: LambdaIntegration

    constructor(scope: Construct, id: string, props: CustLambdaStackProps) {
        super(scope, id, props)


        const custLambda = new NodejsFunction(this, 'CustLambda', {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: (join(__dirname, '..','..', 'services', 'spaces', 'handler.ts')),
            environment: {
                TABLE_NAME: props.customerTable.tableName
            },
            tracing: Tracing.ACTIVE,
            timeout: Duration.minutes(1)
        });

        custLambda.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            resources: [props.customerTable.tableArn],
            actions:[
                'dynamodb:PutItem',
                'dynamodb:GetItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem'
            ]
        }))

        this.custLambdaIntegration = new LambdaIntegration(custLambda)

    }
}