import redis from 'redis';

const redisClient = redis.createClient();

const get = (key: any) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        })
    })
}

const set = (key: any, value: any) => {
    return new Promise((resolve, reject) => {
        redisClient.set(key, value, 'EX', 30, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        })
    })
}

export default { get, set };