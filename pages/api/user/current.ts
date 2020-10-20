import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as User from '../../../lib/mysql/User';
import status from '../../../lib/types/Response';

async function getCurrent(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    const result = await User.getUser(getAuth.uid);
    res.status(200).json({ ok: true, ...result });
}

export default APIErrorHandler(getCurrent);
