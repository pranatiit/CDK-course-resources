import { App } from "aws-cdk-lib";
import { ApiStack } from "./stacks/ApiStack";
import { DataStack } from "./stacks/DataStack";
import { LambdaStack } from "./stacks/LambdaStack";
import { AuthStack } from "./stacks/AuthStack";
import { UiDeploymentStack } from "./stacks/UiDeploymentStack";
import { UiAngularStack } from "./stacks/UiAngularStack";
import { MonitorStack } from "./stacks/MonitorStack";
import { UiBikePartsStack } from "./stacks/UiBikePartsStack";
import { CustDataStack } from "./cust-stacks/CustDataStack";
import { CustLambdaStack } from "./cust-stacks/CustLambdaStack";
import { OrderDataStack } from "./order-stacks/OrderDataStack";
import { OrderLambdaStack } from "./order-stacks/OrderLambdaStack";
import { SQSToLambdaStack } from "./order-stacks/SQSToLambdaStack";



const app = new App();
const dataStack = new DataStack(app, 'DataStack');
const lambdaStack = new LambdaStack(app, 'LambdaStack', {
    spacesTable: dataStack.spacesTable
});

// below stacks for User creation infra
const custDataStack = new CustDataStack(app, 'CustDataStack');
const custLambdaStack = new CustLambdaStack(app, 'CustLambdaStack', {
    customerTable: custDataStack.spacesTable
});


// below stacks for order creation infra
const orderDataStack = new OrderDataStack(app, 'OrderDataStack');
const orderLambdaStack = new OrderLambdaStack(app, 'OrderLambdaStack', {
    orderTable: orderDataStack.orderTable
});

const orderEmailSQSStack = new SQSToLambdaStack(app, 'orderSQSToLambdaStack');

const authStack = new AuthStack(app, 'AuthStack', {
    photosBucket: dataStack.photosBucket,
    profilePicBucket: custDataStack.photosBucket
});


new ApiStack(app, 'ApiStack', {
    spacesLambdaIntegration: lambdaStack.spacesLambdaIntegration,
    custLambdaIntegration: custLambdaStack.custLambdaIntegration,
    orderLambdaIntegration: orderLambdaStack.orderLambdaIntegration,
    orderSQSIntegration: orderEmailSQSStack.orderEmailIntegration,
    userPool: authStack.userPool
});

/*new UiDeploymentStack(app, 'UiDeploymentStack');
//new UiAngularStack(app, 'UiAngularStack');*/
//new UiBikePartsStack(app, 'UiBikePartsStack');

//new MonitorStack(app, 'MonitorStack')