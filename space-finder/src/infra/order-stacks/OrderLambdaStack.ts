import { Duration, Stack, StackProps } from 'aws-cdk-lib'
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Tracing} from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';


interface OrderLambdaStackProps extends StackProps {
    orderTable: ITable
}


export class OrderLambdaStack extends Stack {

    public readonly orderLambdaIntegration: LambdaIntegration

    constructor(scope: Construct, id: string, props: OrderLambdaStackProps) {
        super(scope, id, props)


        const orderLambda = new NodejsFunction(this, 'OrderLambda', {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: (join(__dirname, '..','..', 'services', 'orders', 'OrderHandler.ts')),
            environment: {
                TABLE_NAME: props.orderTable.tableName
            },
            tracing: Tracing.ACTIVE,
            timeout: Duration.minutes(1)
        });

        orderLambda.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            resources: [props.orderTable.tableArn],
            actions:[
                'dynamodb:PutItem',
                'dynamodb:GetItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem'
            ]
        }))

        this.orderLambdaIntegration = new LambdaIntegration(orderLambda)

    }
}