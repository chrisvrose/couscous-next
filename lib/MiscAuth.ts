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
    const { atoken } = req.cookies;
    if (!atoken) throw new ResponseError('No authtoken', 403);

    // do something with atoken
    return new Promise<authResult>((res, rej) => {
        jwt.verify(atoken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                rej(err);
                return;
            }
            const { uid } = user as { uid: string };
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

export async function isAdmin(auth: authResult) {
    const res = await AuthToken.isAdmin(auth.atoken);
    if (!res) {
        throw new ResponseError('Could not get role', 500);
    }
    return res.role;
}

/**
 * Generate a JWT Token
 * @param payload payload to sign
 */
export async function GenerateJWToken(payload: JWTPayload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '3d',
    });
}
