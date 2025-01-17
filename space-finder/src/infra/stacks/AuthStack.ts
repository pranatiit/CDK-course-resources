import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { CfnIdentityPool, CfnIdentityPoolRoleAttachment, CfnUserPoolGroup, UserPool, UserPoolClient, VerificationEmailStyle } from 'aws-cdk-lib/aws-cognito';
import { CfnUserGroup } from 'aws-cdk-lib/aws-elasticache';
import { Effect, FederatedPrincipal, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface AuthStackProps extends StackProps {
    photosBucket: IBucket,
    profilePicBucket: IBucket
}

export class AuthStack extends Stack {

    public userPool: UserPool;
    private userPoolClient: UserPoolClient;
    private identityPool: CfnIdentityPool;
    private authenticatedRole: Role;
    private unAuthenticatedRole: Role;
    private adminRole: Role;

    constructor(scope: Construct, id: string, props: AuthStackProps) {
        super(scope, id, props);

        this.createUserPool();
        this.createUserPoolClient();
        this.createIdentityPool();
        this.createRoles(props.photosBucket, props.profilePicBucket);
        this.attachRoles();
        this.createAdminsGroup();
    }

    private createUserPool(){
        this.userPool = new UserPool(this, 'ToolsBuyerUserPool', {
            selfSignUpEnabled: true,
            signInAliases: {
                /*username: true,*/
                email: true,
                phone: true
            },
            userVerification: {
              emailSubject: 'Verify your email for Hidim ToolParts Service!',
              emailBody: 'Thanks for signing up! Your verification code is {####}',
              emailStyle: VerificationEmailStyle.CODE,
              smsMessage: 'Thanks for signing up to  Hidim ToolParts Service! Your verification code is {####}',
            },
        });

        new CfnOutput(this, 'ToolsBuyerUserPoolId', {
            value: this.userPool.userPoolId
        })
    }
    private createUserPoolClient(){
        this.userPoolClient = this.userPool.addClient('ToolsBuyerUserPoolClient', {
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userPassword: true,
                userSrp: true
            }
        });
        new CfnOutput(this, 'ToolsBuyerUserPoolClientId', {
            value: this.userPoolClient.userPoolClientId
        })
    }

    private createAdminsGroup(){
        new CfnUserPoolGroup(this, 'ProductAdmins', {
            userPoolId: this.userPool.userPoolId,
            groupName: 'admins',
            roleArn: this.adminRole.roleArn
        })
    }

    private createIdentityPool(){
        this.identityPool = new CfnIdentityPool(this, 'ToolsBuyerIdentityPool', {
            allowUnauthenticatedIdentities: true,
            cognitoIdentityProviders: [{
                clientId: this.userPoolClient.userPoolClientId,
                providerName: this.userPool.userPoolProviderName
            }]
        })
        new CfnOutput(this, 'ToolsBuyerIdentityPoolId', {
            value: this.identityPool.ref
        })
    }
    private createRoles(photosBucket: IBucket, profilePicBucket: IBucket){
        this.authenticatedRole = new Role(this, 'CognitoDefaultAuthenticatedRole', {
            assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.ref
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'authenticated'
                }
            },
                'sts:AssumeRoleWithWebIdentity'
            )
        });
        this.unAuthenticatedRole = new Role(this, 'CognitoDefaultUnauthenticatedRole', {
            assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.ref
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'unauthenticated'
                }
            },
                'sts:AssumeRoleWithWebIdentity'
            )
        });
        this.adminRole = new Role(this, 'CognitoAdminRole', {
            assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
                StringEquals: {
                    'cognito-identity.amazonaws.com:aud': this.identityPool.ref
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'authenticated'
                }
            },
                'sts:AssumeRoleWithWebIdentity'
            )
        });
        
        this.adminRole.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                's3:PutObject',
                's3:PutObjectAcl'
            ],
            resources: [photosBucket.bucketArn + '/*']
        }));
        
        this.authenticatedRole.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                's3:PutObject',
                's3:PutObjectAcl'
            ],
            resources: [profilePicBucket.bucketArn + '/*']
        }));
    }

    private attachRoles(){
        new CfnIdentityPoolRoleAttachment(this, 'RolesAttachment', {
            identityPoolId: this.identityPool.ref,
            roles: {
                'authenticated': this.authenticatedRole.roleArn,
                'unauthenticated': this.unAuthenticatedRole.roleArn
            },
            roleMappings: {
                adminsMapping: {
                    type: 'Token',
                    ambiguousRoleResolution: 'AuthenticatedRole',
                    identityProvider: `${this.userPool.userPoolProviderName}:${this.userPoolClient.userPoolClientId}`
                }
            }
        })
    }
}