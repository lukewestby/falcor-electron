import uuid from 'node-uuid';
import createObservable from './createObservable.js';

function createRequest(ipc, context) {
  return createObservable((observer) => {
    const currentRequestId = uuid.v1();
    ipc.on('falcor:response', function handle({ requestId, response }) {
      if (requestId !== currentRequestId) {
        return;
      }
      ipc.removeListener('falcor:response', handle);
      if (response.error) {
        observer.onError(Error(response.error));
      } else {
        observer.onNext(response.data);
        observer.onCompleted();
      }
    });
    ipc.send('falcor:request', {
      requestId: currentRequestId,
      context
    });
  });
}

export default function createIpcDataSource(ipc) {
  return {
    get(paths) {
      return createRequest(ipc, {
        method: 'get',
        paths
      });
    },

    set(jsonGraph) {
      return createRequest(ipc, {
        method: 'set',
        jsonGraph
      });
    },

    call(callPath, args = [], pathSuffixes = [], paths = []) {
      return createRequest(ipc, {
        callPath,
        pathSuffixes,
        paths,
        arguments: args,
        method: 'call'
      });
    }
  };
}
