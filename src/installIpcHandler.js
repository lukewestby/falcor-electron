import guard from './guard.js';

export default function installIpcHandler(ipc, getDataSource) {
  function sendResponse(requestId, response) {
    ipc.send('falcor:response', {
      requestId,
      response
    });
  }

  function handleRequest(ev, {
    context,
    requestId
  }) {
    const dataSource = getDataSource();

    const error = guard([
      [Object.keys(context).length === 0, 'Request not supported.'],
      [typeof context.method === 'undefined', 'No query method provided.'],
      [typeof dataSource[context.method] === 'undefined', 'Data source does not implement the requested method.']
    ]);

    if (error) {
      return sendResponse(requestId, { error });
    }

    const args = guard([
      [context.method === 'set', [context.jsonGraph]],
      [context.method === 'call', [context.callPath, context.arguments, context.pathSuffixes, context.paths]],
      [true, [[].concat(context.paths)]]
    ]);

    const observable = dataSource[context.method](...args);

    observable.subscribe(
      (data) => sendResponse(requestId, { data }),
      (error) => sendResponse(requestId, { error: error.message })
    );
  }

  ipc.on('falcor:request', handleRequest);
}
