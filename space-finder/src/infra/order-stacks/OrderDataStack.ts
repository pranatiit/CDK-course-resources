import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../Utils';

export class OrderDataStack extends Stack {

    public readonly orderTable: ITable;

    

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const suffix = getSuffixFromStack(this);


        this.orderTable = new Table(this, 'Orders', {
            partitionKey : {
                name: 'id',
                type: AttributeType.STRING
            },
            tableName: `Orders-${suffix}`
        })
    }
}