import { NextApiRequest, NextApiResponse } from 'next';
import Response from './types/Response';
import ResponseError from './types/ResponseError';

export default function (
    wrapped: (
        req: NextApiRequest,
        res: NextApiResponse<Response>
    ) => Promise<void>
) {
    return async function WrappedHandle(
        req: NextApiRequest,
        res: NextApiResponse<Response>
    ) {
        try {
            await wrapped(req, res);
        } catch (err) {
            if (err instanceof ResponseError) {
                res.status(err.statusCode).json({
                    ok: false,
                    status: err.message,
                });
            } else {
                if (!res.headersSent) {
                    res.status(500);
                }
                res.json({
                    ok: false,
                    status: err?.message ?? 'Generic Server Error',
                });
            }
        }
    };
}
