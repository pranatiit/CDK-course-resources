import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";
import { AuthService } from "./AuthService";


async function testAuth(){
    const service = new AuthService();
    const loginResult = await service.login(
        'harsa',
        'Test@123'
    )
    console.log(loginResult.getSignInUserSession().getIdToken().getJwtToken());
    console.log('Sign in Token generated');
    //const credentials = await service.generateTemporaryCredentials(loginResult);
    //console.log(credentials);
    //const buckets = await listBuckets(credentials);
    //console.log(buckets);
}

async function listBuckets(credentials: any){
    const client = new S3Client({
        credentials: credentials
    });
    const command = new ListBucketsCommand({});
    const result = await client.send(command);
    return result;
}

testAuth();