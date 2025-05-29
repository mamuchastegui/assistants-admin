import assert from 'assert';
import { subscribeToHumanNeeded } from '../src/hooks/notifications/eventSourceSubscriber.js';

let closed = false;
let listeners = {};

class MockEventSource {
  constructor(url) {
    this.url = url;
  }
  addEventListener(type, cb) {
    listeners[type] = cb;
  }
  close() {
    closed = true;
  }
}

global.EventSource = MockEventSource;

let received = [];
const sub = subscribeToHumanNeeded({
  token: 't',
  assistantId: '1',
  onMessage: (type, data) => received.push(`${type}:${data}`)
});

listeners['initial']({ type: 'initial', data: '2' });
listeners['update']({ type: 'update', data: '3' });

assert.deepEqual(received, ['initial:2', 'update:3']);
sub.close();
assert.ok(closed);

console.log('eventSourceSubscriber test passed');
