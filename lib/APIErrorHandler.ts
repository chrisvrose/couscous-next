import { NextApiRequest, NextApiResponse } from 'next';
import { performance } from 'perf_hooks';
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
            // console.time(``)
            const time1 = performance.now();
            await wrapped(req, res);
            const time2 = performance.now();
            console.log(req?.url, `${(time2 - time1).toFixed(4)} ms`);
        } catch (err) {
            if (err instanceof ResponseError) {
                console.error('E>Response Error', req?.url, req?.body, err);
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
