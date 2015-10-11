import test from 'tape';
import { installIpcHandler, createIpcDataSource } from '../src/index.js';
import Router from 'falcor-router';
import { Model } from 'falcor';
import EventEmitter from 'events';

function createIpc() {
  const ipc = new EventEmitter();
  ipc.send = function(name, ...args) {
    ipc.emit(name, {
      sender: {
        send(name, ...args) {
          ipc.emit(name, {}, ...args);
        }
      }
    }, ...args);
  };
  return ipc;
}

function setupTest() {

  const ipc = createIpc();
  const db = { test: 1 };

  installIpcHandler(ipc, () => {
    return new Router([
      {
        route: 'test',
        get() {
          return { path: ['test'], value: db.test };
        },
        set(jsonGraph) {
          db.test = jsonGraph.test;
          return { path: ['test'], value: db.test };
        }
      },
      {
        route: 'addValue',
        call(callPath, [name, value]) {
          db[name] = value;
          return { path: [name], value };
        }
      }
    ]);
  });

  return new Model({
    source: createIpcDataSource(ipc)
  });
}

test('IpcDataSource', (t) => {

  t.test('get()', (t) => {
    t.plan(1);

    const model = setupTest();

    model
      .get(['test'])
      .then((response) => {
        t.deepEqual(response, { json: { test: 1 } }, 'get should succeed');
      });
  });

  t.test('set()', (t) => {
    t.plan(1);

    const model = setupTest();

    model
      .set({ path: ['test'], value: 2 })
      .then((response) => {
        t.deepEqual(response, { json: { test: 2 } }, 'set should succeed');
      });
  });

  t.test('call()', (t) => {
    t.plan(1);

    const model = setupTest();

    model
      .call(['addValue'], ['test1', 4])
      .then((response) => {
        t.deepEqual(response, { json: { test1: 4 } }, 'call should succeed');
      });
  });
});
