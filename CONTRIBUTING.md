## Tests

```shell
yarn check
yarn test        # once
yarn test:watch  # watch mode
```

Note: `yarn test:watch` doesn't rebuild the doc test file. Run `yarn
test:docs:watch` to watch (just) the doc sources.

### Doc Tests

The following tests the doc examples. (Currently this is just the first fenced
TypeScript block in the README.)

```shell
$ yarn test:docs        # once
$ yarn test:docs:watch  # watch mode
```

Note: `yarn test:docs:watch` requires [entr](http://www.entrproject.org). On
macOS: `brew install entr`.

Note: After running `yarn test:docs:watch`, you will need to kill the process.
Typing `q` exits only the `jest` process.
