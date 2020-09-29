// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import assert from 'assert';
import cookie from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import * as AuthToken from '../../../lib/mysql/AuthToken';
import * as User from '../../../lib/mysql/User';
import status from '../../../lib/types/Response';
import ResponseError from '../../../lib/types/ResponseError';

async function login(req: NextApiRequest, res: NextApiResponse<status>) {
    // assert that they exist

    assert(req.body.email, 'expected email');
    assert(req.body.pwd, 'expected pwd');

    // now pass them onto User to validate

    const authuid = await User.authPass(req.body.email, req.body.pwd);
    if (authuid) {
        const atoken = await AuthToken.add(authuid.uid);
        if (atoken) {
            res.setHeader(
                'Set-Cookie',
                cookie.serialize('atoken', atoken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 259200,
                })
            );
            res.json({
                ok: true,
                uid: authuid.uid,
                status: `Logged in as ${req.body.email}`,
            });
        } else {
            throw new ResponseError('could not allocate access token');
        }
    } else {
        throw new ResponseError('could not auth', 403);
    }
}

export default APIErrorHandler(login);
