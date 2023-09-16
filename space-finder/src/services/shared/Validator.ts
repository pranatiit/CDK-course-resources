import { OrderEntry, ToolsItemEntry } from "../model/Model";

export class MissingFieldError extends Error {
    constructor(missingField: string) {
        super(`Value for ${missingField} expected!`)
    }
}


export class JsonError extends Error {}

export function validateAsToolsItemEntry(arg: any){
    if ((arg as ToolsItemEntry).name == undefined) {
        throw new MissingFieldError('name')
    }
    if ((arg as ToolsItemEntry).id == undefined) {
        throw new MissingFieldError('id')
    }
}


export function validateAsOrderItemEntry(arg: any){
    if ((arg as OrderEntry).customerId == undefined) {
        throw new MissingFieldError('customerId')
    }
    if ((arg as OrderEntry).id == undefined) {
        throw new MissingFieldError('id')
    }
    if ((arg as OrderEntry).items == undefined) {
        throw new MissingFieldError('items')
    }
}