// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as File from '../../../lib/mysql/File';
import * as Folder from '../../../lib/mysql/Folder';
import status from '../../../lib/types/Response';

async function unlink(req: NextApiRequest, res: NextApiResponse<status>) {
    const authResult = await auth(req);
    // await mongos.connect();
    const { path } = await Folder.getPathFromBody(req);
    // TODO
    const result = await File.unlink(authResult.uid, path);
    // const result = await File.open(path, authResult.uid, operation);

    // console.log(result);
    // res.send(result);
    // res.setHeader('Content-Type', 'application/octet-stream');
    // res.end(result);
    res.json({ ok: true, result });
}

export default APIErrorHandler(unlink);
