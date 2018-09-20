Test:

```shell
yarn check
yarn test        # once
yarn test:watch  # watch mode
```

Test the docs.

Note: `yarn test:docs:watch` requires [entr](http://www.entrproject.org). On
macOS: `brew install entr`.

Note: After running `yarn test:docs:watch`, you will need to kill the process.
Typing `q` exits only the `jest` process.

```shell
$ yarn test:docs        # once
$ yarn test:docs:watch  # watch mode
```
