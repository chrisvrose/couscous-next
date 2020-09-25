// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/authenticate';
import * as AuthToken from '../../../lib/mysql/AuthToken';
import status from '../../../lib/types/Response';
import ResponseError from '../../../lib/types/ResponseError';

async function logout(req: NextApiRequest, res: NextApiResponse<status>) {
    //get uid to make sure he is logged in
    const authResult = await auth(req);
    if (authResult) {
        const { uid, atoken } = authResult;
        //here, user is auth-ed
        //remove all atoken
        await AuthToken.remove(uid, atoken);
        res.json({ ok: true, logout: uid });
    } else {
        throw new ResponseError('invalid login', 403);
    }
}

export default APIErrorHandler(logout);
