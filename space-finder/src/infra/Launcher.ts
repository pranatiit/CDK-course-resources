import { App } from "aws-cdk-lib";
import { ApiStack } from "./stacks/ApiStack";
import { DataStack } from "./stacks/DataStack";
import { LambdaStack } from "./stacks/LambdaStack";
import { AuthStack } from "./stacks/AuthStack";
import { UiDeploymentStack } from "./stacks/UiDeploymentStack";
import { UiAngularStack } from "./stacks/UiAngularStack";
import { MonitorStack } from "./stacks/MonitorStack";
import { UiBikePartsStack } from "./stacks/UiBikePartsStack";



const app = new App();
const dataStack = new DataStack(app, 'DataStack');
const lambdaStack = new LambdaStack(app, 'LambdaStack', {
    spacesTable: dataStack.spacesTable
});
const authStack = new AuthStack(app, 'AuthStack', {
    photosBucket: dataStack.photosBucket
});
new ApiStack(app, 'ApiStack', {
    spacesLambdaIntegration: lambdaStack.spacesLambdaIntegration,
    userPool: authStack.userPool
});
/*new UiDeploymentStack(app, 'UiDeploymentStack');
//new UiAngularStack(app, 'UiAngularStack');*/
new UiBikePartsStack(app, 'UiBikePartsStack');

//new MonitorStack(app, 'MonitorStack')