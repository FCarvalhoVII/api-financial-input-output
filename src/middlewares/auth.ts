import jwt from 'jsonwebtoken';
import authConfig from '../config/auth';
import { Request, Response, NextFunction } from 'express';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ error: 'No token provided' });
    }

    const parts = authHeader.split(' ');

    if (!(parts.length === 2)) {
        return res.status(401).send({ error: 'Token error' });
    }

    const [ scheme, token ] = parts;

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if(err) {
            return res.status(401).send({ error: 'Token invalid' });
        }

        req.userId = decoded!.userId;

        return next();
    });
}

export default authMiddleware;