// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as Folder from '../../../lib/mysql/Folder';
import status from '../../../lib/types/Response';

async function read(req: NextApiRequest, res: NextApiResponse<status>) {
    await auth(req);
    // await mongos.connect();
    const body = await Folder.getPathFromBody(req);
    const contents = await Folder.getContents(body.path);

    res.json({ ok: true, contents });
}

export default APIErrorHandler(read);
