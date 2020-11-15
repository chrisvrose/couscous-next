// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import status from '../../../lib/types/Response';

async function read(req: NextApiRequest, res: NextApiResponse<status>) {
    await auth(req);
    res.json({ ok: true, fd: 42 });
}

export default APIErrorHandler(read);
