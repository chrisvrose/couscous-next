// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as Folder from '../../../lib/mysql/Folder';
import status from '../../../lib/types/Response';

async function remove(req: NextApiRequest, res: NextApiResponse<status>) {
    await auth(req);
    const body = await Folder.getPathFromBody(req);

    const changed = await Folder.remove(body.path);
    // const stat = await GeneralOps.getattr(body.path);
    //strip the mongo file ids
    res.json({ ok: true, changed });
}

export default APIErrorHandler(remove);
