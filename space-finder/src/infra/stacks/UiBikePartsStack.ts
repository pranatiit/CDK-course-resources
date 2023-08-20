import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { getSuffixFromStack } from "../Utils";
import { join } from "path";
import { existsSync } from "fs";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Distribution, OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";


export class UiBikePartsStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const suffix = getSuffixFromStack(this);

        const deploymentBucket = new Bucket(this, 'UiToolPartsDeploymentBucket', {
            bucketName: `toolparts-frontend-${suffix}`
        });

        const uiDir = join(__dirname, '..', '..', '..', '..', 'bike-parts-frontend', 'dist');
        if (!existsSync(uiDir)) {
            console.warn('Ui dir not found: ' + uiDir);
            return;
        }

        new BucketDeployment(this, 'UiBikePartsDeployment', {
            destinationBucket: deploymentBucket,
            sources: [Source.asset(uiDir)]
        });

        const originIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
        deploymentBucket.grantRead(originIdentity);

        const distribution = new Distribution(this, 'UiBikePartsDistribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: new S3Origin(deploymentBucket, {
                    originAccessIdentity: originIdentity
                })
            },
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: "/index.html"
                }
            ],
        });

        new CfnOutput(this, 'UiBikePartsUrl', {
            value: distribution.distributionDomainName
        })
    }


}