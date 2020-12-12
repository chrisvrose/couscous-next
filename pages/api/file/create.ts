// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as File from '../../../lib/mysql/File';
import * as GeneralOps from '../../../lib/mysql/GeneralFSOps';
import status from '../../../lib/types/Response';

async function getattr(req: NextApiRequest, res: NextApiResponse<status>) {
    const authdetails = await auth(req);
    const { path, permissions } = await GeneralOps.getPathPermsFromBody(req);
    const result = await File.create(path, authdetails.uid, permissions);
    // const changed = await GeneralOps.chmod(path, permissions, authdetails.uid);
    res.json({ ok: true, result });
}

export default APIErrorHandler(getattr);
