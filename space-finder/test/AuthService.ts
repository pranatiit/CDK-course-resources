import { type CognitoUser } from '@aws-amplify/auth';
import { Amplify, Auth } from 'aws-amplify';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers'

const awsRegion = 'ap-south-1'

Amplify.configure({
    Auth: {
        region: awsRegion,
        userPoolId: 'ap-south-1_jWoHZDUXZ',
        userPoolWebClientId: '66519q6p8h8pal9dg2gdp1mfi',
        identityPoolId: 'ap-south-1:884c9de5-759b-405b-b8c2-68e0f0eeebda',
        authenticationFlowType: 'USER_PASSWORD_AUTH'
    }
});



export class AuthService {

    public async login(userName: string, password: string) {
        const result = await Auth.signIn(userName, password) as CognitoUser;
        return result;
    }

    public async generateTemporaryCredentials(user: CognitoUser){
        const jwtToken = user.getSignInUserSession().getIdToken().getJwtToken();
        const cognitoIdentityPool = `cognito-idp:ap-south-1:302131390279:userpool/ap-south-1_jWoHZDUXZ`;
        const cognitoIdentity = new CognitoIdentityClient({
            credentials: fromCognitoIdentityPool({
                identityPoolId: 'ap-south-1:884c9de5-759b-405b-b8c2-68e0f0eeebda',
                logins: {
                    [cognitoIdentityPool]: jwtToken
                }
            })
        });
        const credentials = await cognitoIdentity.config.credentials();
        return credentials;
    }
}