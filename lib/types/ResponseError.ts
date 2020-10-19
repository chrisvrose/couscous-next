export default class ResponseError extends Error {
    private _statusCode: number;
    /**
     * Make a new responseError
     * @param message Message to send
     * @param statusCode Status code (500)
     */
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this._statusCode = statusCode;
    }

    get statusCode() {
        return this._statusCode;
    }
}
