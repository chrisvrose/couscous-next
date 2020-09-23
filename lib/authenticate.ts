/*
 * My work -
 * authenticate
 * then, throw an error if the jwt doesnt work
 */

import { NextApiRequest, NextApiResponse } from 'next';

// interface userpass {
//     uid: string;
//     pwd: string;
// }

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
    const authHeader = res.getHeader('authorization')?.toString();
    const atoken = authHeader?.split(' ')[1];
    console.log(atoken);
}
