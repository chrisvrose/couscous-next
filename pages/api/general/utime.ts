// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as GeneralOps from '../../../lib/mysql/GeneralFSOps';
import status from '../../../lib/types/Response';

async function utime(req: NextApiRequest, res: NextApiResponse<status>) {
    const { uid } = await auth(req);
    const { path, atime, mtime } = GeneralOps.getTimesFromBody(req);
    const result = await GeneralOps.utime(path, mtime, atime, uid);
    //strip the mongo file ids
    res.json({ ok: true, result });
}

export default APIErrorHandler(utime);
