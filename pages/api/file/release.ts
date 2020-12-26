// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as File from '../../../lib/mysql/File';
import status from '../../../lib/types/Response';

async function release(req: NextApiRequest, res: NextApiResponse<status>) {
    const authResult = await auth(req);
    const { path, fd } = await File.getPathFdFromBody(req);

    const released = await File.release(path, authResult.uid, fd);

    res.json({ ok: true, released });
}

export default APIErrorHandler(release);
