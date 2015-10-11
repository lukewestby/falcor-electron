import partial from 'lodash.partial';

function noop() { }

function subscribe(subscriber, onNext, onError = noop, onCompleted = noop) {
  const observer = typeof onNext === 'function' ?
    { onNext, onError, onCompleted } :
    onNext;

  const disposable = subscriber(observer);

  return typeof disposable === 'function' ?
    { dispose: disposable } :
    disposable;
}

export default function createObservable(subscriber) {
  return {
    subscribe: partial(subscribe, subscriber)
  };
}
