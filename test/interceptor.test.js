import assert from 'assert';
import axios from 'axios';
import { attachDevAuthInterceptor } from '../src/devAuth/interceptor.js';

let token = 'test-token';
const instance = axios.create();
attachDevAuthInterceptor(instance, () => token, () => {});

const handler = instance.interceptors.request.handlers[0].fulfilled;
const config = handler({ headers: {} });
assert.equal(config.headers.Authorization, `Bearer ${token}`);
console.log('Interceptor test passed');
