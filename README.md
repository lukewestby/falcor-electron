# falcor-electron

[Falcor](https://github.com/Netflix/falcor) integration for
[electron](https://github.com/atom/electron) using the `ipc` module.

## Usage

Install your `Router` as a data source in the main process.

```javascript
import ipc from 'ipc';
import Router from 'falcor-router';
import { installIpcHandler } from 'falcor-electron';

installIpcHandler(ipc, () => {
  return new Router([
    // ... routes
  ]);
});
```

Configure your `Model` with an `IpcDataSource` in the renderer process.

```javascript
import ipc from 'ipc';
import { Model } from 'falcor';
import { createIpcDataSource } from 'falcor-electron';

const model = new Model({
  source: createIpcDataSource(ipc)
});
```

## Contributing

Feature requests and bugs/bug fixes are happily accepted and can be submitted
either as issues or pull requests.

- Source is compiled with `babel` (stage 0)
- Source is linted with `eslint`
- Tests are run with `tape`

For code contributions, please fork `develop` and submit a PR.
