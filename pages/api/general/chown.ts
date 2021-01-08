// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as GeneralOps from '../../../lib/mysql/GeneralFSOps';
import status from '../../../lib/types/Response';

async function chown(req: NextApiRequest, res: NextApiResponse<status>) {
    const authdetails = await auth(req);
    const { path, uid, gid } = GeneralOps.getUIDGIDFromBody(req);
    const changed = await GeneralOps.chown(path, uid, gid, authdetails.uid);
    res.json({ ok: true, changed });
}

export default APIErrorHandler(chown);
