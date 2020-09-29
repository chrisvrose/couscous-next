// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../lib/APIErrorHandler';
import { auth } from '../../lib/authenticate';
import status from '../../lib/types/Response';

async function jwttest(req: NextApiRequest, res: NextApiResponse<status>) {
    await auth(req);
    res.status(200).json({ ok: true, test: true });
}

export default APIErrorHandler(jwttest);
