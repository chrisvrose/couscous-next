// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../lib/APIErrorHandler';
import { auth, isAdmin } from '../../lib/MiscAuth';
import status from '../../lib/types/Response';

async function isAdminRoute(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    await isAdmin(getAuth);
    res.status(200).json({ ok: true, test: true });
}

export default APIErrorHandler(isAdminRoute);
