// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../lib/APIErrorHandler';
import { auth } from '../../lib/authenticate';
import status from '../../lib/types/Response';

async function jwttest(req: NextApiRequest, res: NextApiResponse<status>) {
    try {
        await auth(req);
        res.status(200).json({ ok: true, test: true });
    } catch (e) {
        res.status(500).json({
            ok: false,
            test: false,
            status: e?.message ?? 'Could not perform',
        });
    }
}

export default APIErrorHandler(jwttest);
