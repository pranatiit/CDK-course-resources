import { ToolsItemEntry } from "../model/Model";

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