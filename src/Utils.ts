import jwt from 'jsonwebtoken';
import authConfig from './config/auth';

export default class Utils {

    public static generateToken(params = {}) {
        return jwt.sign(params, authConfig.secret);
    }

    public static calculateAge(birthDate: string) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const birthYearParts = birthDate.split('/');
        const dayBirth = parseInt(birthYearParts[1]);
        const monthBirth = parseInt(birthYearParts[0]);
        const yearBirth = parseInt(birthYearParts[2]);

        let age = currentYear - yearBirth;
        const currentMonth = currentDate.getMonth() + 1;

        if (currentMonth < monthBirth) {
            age--;

        } else {
            if (currentMonth == monthBirth) {
                if (new Date().getDate() < dayBirth) {
                    age--;

                }
            }
        }

        return age;
    }
}