/**
 * The default response type
 */
interface status {
    ok: true | false;
    status?: any;
    [propName: string]: any;
}

export default status;
