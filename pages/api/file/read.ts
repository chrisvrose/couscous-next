// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as File from '../../../lib/mysql/File';

async function read(req: NextApiRequest, res: NextApiResponse) {
    const authResult = await auth(req);
    // await mongos.connect();
    const { fd, length, position } = await File.getReadOperationFromBody(req);
    // TODO
    const result = await File.read(fd, authResult.uid, length, position);
    // const result = await File.open(path, authResult.uid, operation);

    // console.log(result);
    res.send(result);
    // res.setHeader('Content-Type', 'application/octet-stream');
    // res.end(result);
    // res.json({ ok: true });
}

export default APIErrorHandler(read);
