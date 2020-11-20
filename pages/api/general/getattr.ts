// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as Folder from '../../../lib/mysql/Folder';
import * as GeneralOps from '../../../lib/mysql/GeneralFSOps';
import status from '../../../lib/types/Response';

async function getattr(req: NextApiRequest, res: NextApiResponse<status>) {
    await auth(req);
    const body = await Folder.getFromBody(req);
    const stat = await GeneralOps.getattr(body.path);
    //strip the mongo file ids
    stat.mongofileuid = undefined;
    res.json({ ok: true, stat: stat });
}

export default APIErrorHandler(getattr);
