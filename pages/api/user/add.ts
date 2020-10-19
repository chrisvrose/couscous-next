import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { assertAdmin, auth } from '../../../lib/MiscAuth';
import * as User from '../../../lib/mysql/User';
import status from '../../../lib/types/Response';

async function addUser(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    const admin = assertAdmin(getAuth);
    //ensure all this is there
    const newUser = await User.getFromBody(req);
    await admin;

    const result = await User.add(newUser);
    res.status(200).json({ ok: true, ...result });
}

export default APIErrorHandler(addUser);
