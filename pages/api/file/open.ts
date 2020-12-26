// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as File from '../../../lib/mysql/File';
import status from '../../../lib/types/Response';

async function open(req: NextApiRequest, res: NextApiResponse<status>) {
    const authResult = await auth(req);

    const { operation, path } = await File.getOpenOperationFromBody(req);

    const result = await File.open(path, authResult.uid, operation);

    res.json({ ok: true, result });
}

export default APIErrorHandler(open);
