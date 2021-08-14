import mongoose from '../database/connection';

const UserSchema = new mongoose.Schema({
    login: {
        type: String,
        unique: true,
        require: true,
        null: false
    },
    password: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
        lowercase: true
    },
    name: {
        type: String,
        require: true,
        null: false
    },
    birthDate: {
        type: String,
        null: false,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);

export default User;