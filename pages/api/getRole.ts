// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../lib/APIErrorHandler';
import { assertAdmin, auth } from '../../lib/MiscAuth';
import status from '../../lib/types/Response';

async function getRole(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    await assertAdmin(getAuth);
    res.status(200).json({ ok: true, test: true });
}

export default APIErrorHandler(getRole);
