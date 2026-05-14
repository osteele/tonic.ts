# Contributing

## Tests

```shell
bun run check
bun run test        # once
bun run test:watch  # watch mode
```

Note: `bun run test:watch` doesn't rebuild the doc test file. Run `bun run
test:docs:watch` to watch (just) the doc sources.

### Doc Tests

The following tests the doc examples. (Currently this is just the first fenced
TypeScript block in the README.)

```shell
bun run test:docs        # once
bun run test:docs:watch  # watch mode
```

Note: `bun run test:docs:watch` requires [entr](http://www.entrproject.org). On
macOS: `brew install entr`.

Note: After running `bun run test:docs:watch`, you will need to kill the process.
Typing `q` exits only the `jest` process.
