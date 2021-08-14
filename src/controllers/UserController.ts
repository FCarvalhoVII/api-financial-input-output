import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { Request, Response } from 'express';
import Utils from '../Utils';

export default class UserController {

    public static async register(req: Request, res: Response) {
        const { login, password, email, name, birthDate } = req.body;

        try {
            const validEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
            const validDate = /^\d{2}([./-])\d{2}\1\d{4}$/;
            const validPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            const newBirthDate = moment(birthDate, "MM-DD-YYYY");
            const age = moment().diff(birthDate, 'years');

            if (!login || !name) {
                return res.status(400).send({ error: 'Null login or name' });
            }

            if (await User.findOne({ login }) || await User.findOne({ email }) ) {
                return res.status(400).send({ error: 'User already registered' });
            }

            if (!(validEmail.test(email))) {
                return res.status(400).send({ error: 'Email invalid' });
            }

            if (!(validPassword.test(password))) {
                return res.status(400).send({ error: 'The password must contain at least eight characters, at least one uppercase letter, one lowercase letter, one number and one special character' });
            }

            if (!(validDate.test(birthDate))) {
                return res.status(400).send({ error: 'Invalid birthDate, try mm/dd/yyyy' });
            }

            if (age < 18) {
                return res.status(400).send({ error: 'User is not 18 years old' });
            }

            const hash = await bcrypt.hash(password, 10)

            const user = await User.create({
                login,
                password: hash,
                email,
                name,
                birthDate: newBirthDate
            });

            user.password = undefined;

            return res.send({ user });

        } catch(err) {
            return res.status(400).send({ error: 'Registration failed' });
        }
    }

    public static async authenticate(req: Request, res: Response) {
        const { username, password } = req.body;

        try {
            const user = await User.findOne({ login: username });

            if (!user) {
                return res.status(400).send({ error: 'User not exists' });
            }

            if (!await bcrypt.compare(password, user.password)) {
                return res.status(400).send({ error: 'Invalid password' });
            }

            return res.send({ token: Utils.generateToken({ userId: user._id, name: user.name }) });

        } catch(err) {
            return res.status(400).send({ error: 'Login failed' });
        }
    }

    public static async authenticated(req: Request, res: Response) {
        const { authorization } = req.headers;
        const token = authorization?.split(' ')[1];

        if (!token) {
            return res.status(400).send({ error: 'Missing authorization token' });
        }

        const payload = jwt.decode(token!);

        if (!payload) {
            return res.status(400).send({ error: 'Token invalid' })
        }

        return res.send(payload);
    }
}