/*
 * My work -
 * authenticate
 * then, throw an error if the jwt doesnt work
 */

import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';
import AuthToken from './mysql/AuthToken';

export interface JWTPayload {
    uid: number;
}

/**
 * Validate an incoming JWT Token
 * @param req Request
 * @param res Response
 */
export async function auth(req: NextApiRequest) {
    // const authHeader = res.getHeader('authorization')?.toString();
    const authHeader = req.headers.authorization;
    const atoken = authHeader?.split(' ')[1];
    // do something with atoken
    // const contents = jwt.verify(atoken,process.env.ACCESS_TOKEN_SECRET)
    return new Promise<number>((res, rej) => {
        jwt.verify(atoken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                rej(err);
                return;
            }
            const { uid } = <{ uid: string }>user;
            const uidnumber = parseInt(uid);
            AuthToken.get(uidnumber, atoken).then(
                isLoggedIn => {
                    if (isLoggedIn) {
                        res(uidnumber);
                    } else {
                        rej(Error('could not auth'));
                    }
                },
                rejreason => {
                    rej(rejreason);
                }
            );
        });
    });

    throw Error('not auth');
    // return true;
}

/**
 * Generate a JWT Token
 * @param payload payload to sign
 */
export async function GenerateJWToken(payload: JWTPayload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
}
