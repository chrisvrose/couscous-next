// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as File from '../../../lib/mysql/File';

async function write(req: NextApiRequest, res: NextApiResponse) {
    const authResult = await auth(req);

    const body = File.getWriteOperationFromBody(req);
    const { fd, length, position, buffer } = body;
    // console.log('I>WRITING', length, position);
    console.log(body);
    const result = await File.write(
        fd,
        authResult.uid,
        length,
        position,
        buffer
    );

    res.json({ ok: true, result });
}

export default APIErrorHandler(write);
