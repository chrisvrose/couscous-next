// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import assert from 'assert';
import { NextApiRequest, NextApiResponse } from 'next';
import AuthToken from '../../../lib/mysql/AuthToken';
import User from '../../../lib/mysql/User';
import status from '../../../lib/response';

export default async (req: NextApiRequest, res: NextApiResponse<status>) => {
    try {
        // assert that they exist
        assert(req.body.email, 'expected email');
        assert(req.body.pwd, 'expected pwd');

        // now pass them onto User to validate

        const authuid = await User.authPass(req.body.email, req.body.pwd);
        if (authuid) {
            const atoken = await AuthToken.add(authuid);
            if (atoken) {
                res.json({ ok: true, uid: authuid, atoken });
            } else {
                throw Error('could not allocate access token');
            }
        } else {
            res.status(403).json({ ok: false, auth: authuid });
        }

        // const token = await AuthToken.add(1);
        // if (token) {
        //     res.status(200).json({ ok: true });
        // } else {
        //     throw Error('No authtoken');
        // }
    } catch (err) {
        res.status(500).json({ ok: false, status: err?.message ?? 'error' });
    }
};
