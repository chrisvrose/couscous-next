export default class ResponseError extends Error {
    private _statusCode: number;
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this._statusCode = statusCode;
    }

    get statusCode() {
        return this._statusCode;
    }
}
