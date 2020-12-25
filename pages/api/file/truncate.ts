// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as File from '../../../lib/mysql/File';
import status from '../../../lib/types/Response';

async function unlink(req: NextApiRequest, res: NextApiResponse<status>) {
    const authResult = await auth(req);
    // await mongos.connect();
    const { path, size } = File.getPathSizeFromBody(req);

    const result = await File.truncate(authResult.uid, path, size);

    res.json({ ok: true, result });
}

export default APIErrorHandler(unlink);
