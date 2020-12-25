// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as File from '../../../lib/mysql/File';

async function read(req: NextApiRequest, res: NextApiResponse) {
    const authResult = await auth(req);
    // await mongos.connect();
    const { fd, length, position } = await File.getReadOperationFromBody(req);

    const result = await File.read(fd, authResult.uid, length, position);

    res.send(result);
}

export default APIErrorHandler(read);
