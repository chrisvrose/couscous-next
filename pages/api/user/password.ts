import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as User from '../../../lib/mysql/User';
import status from '../../../lib/types/Response';
import ResponseError from '../../../lib/types/ResponseError';

async function changePwd(req: NextApiRequest, res: NextApiResponse<status>) {
    // auth and get back the data
    const { uid } = await auth(req);
    // ensure password is present
    if (typeof req.body.pwd !== 'string') {
        throw new ResponseError('Expected password', 400);
    }
    const result = User.updatePwd(uid, req.body.pwd);
    res.status(200).json({ ok: true, ...result });
}

export default APIErrorHandler(changePwd);
