/* eslint-disable prefer-promise-reject-errors */
const redis = require('redis');
var client = redis.createClient({
  host: 'redis-14452.c1.asia-northeast1-1.gce.cloud.redislabs.com',
  port: 14452,
  password: '5dKfL12HXHxJscFv65LjcrNT0ihK6vlH'
});

client.on('connect', () => {
});
client.on('error', function (err: any) {
  console.log('Redis Error:', err);
});

export default class RedisController {
  updateValue (key: string, value: any, ttl: any) {
    return new Promise((resolve, reject) => {
      client.set(key, value, function (err: any, value: any) {
        if (err) {
          console.log('[RedisController][updateValue][client.hmset]', err);
          reject(null);
        } else {
          client.expire(key, ttl);
          resolve(value);
        }
      });
    });
  }

  removeValue (key: string) {
    return new Promise((resolve, reject) => {
      client.del(key, (err: any, value: any) => {
        if (err) {
          console.log('[RedisController][removeValue][client.del]', err);
        }
      });
    });
  }

  getValue (name: string) {
    return new Promise((resolve, reject) => {
      client.get(name, (err: any, value: any) => {
        if (err) {
          console.log('[RedisController][getValue][client.hgetall]', err);
          reject(null);
        } else {
          resolve(value);
        }
      });
    });
  }
}
