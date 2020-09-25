/*
 * My work -
 * authenticate
 * then, throw an error if the jwt doesnt work
 */

import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';
import * as AuthToken from './mysql/AuthToken';
import ResponseError from './types/ResponseError';

export interface JWTPayload {
    uid: number;
}

export interface authResult {
    uid: number;
    atoken: string;
}

/**
 * Validate an incoming JWT Token
 * @param req Request
 * @param res Response
 */
export async function auth(req: NextApiRequest): Promise<authResult> {
    // const authHeader = res.getHeader('authorization')?.toString();
    const authHeader = req.headers.authorization;
    const atoken = authHeader?.split(' ')[1];
    // do something with atoken
    // const contents = jwt.verify(atoken,process.env.ACCESS_TOKEN_SECRET)
    return new Promise<authResult>((res, rej) => {
        jwt.verify(atoken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                rej(err);
                return;
            }
            const { uid } = <{ uid: string }>user;
            const uidnumber = parseInt(uid);
            AuthToken.getExists(uidnumber, atoken).then(
                isLoggedIn => {
                    if (isLoggedIn) {
                        res({ uid: uidnumber, atoken });
                    } else {
                        rej(new ResponseError('could not auth', 403));
                    }
                },
                rejreason => {
                    rej(rejreason);
                }
            );
        });
    });
}

/**
 * Generate a JWT Token
 * @param payload payload to sign
 */
export async function GenerateJWToken(payload: JWTPayload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
}
