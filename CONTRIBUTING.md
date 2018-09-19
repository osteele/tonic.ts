Test:

```shell
yarn check
yarn test
```

Test watch:

```shell
yarn test:watch
```

Test the docs:

```shell
npx ts-node extractDocTests.ts
yarn test
```

Watch and test the docs, in two processes:

```shell
ls extractDocTests.ts README.md | entr -s 'npx ts-node extractDocTests.ts'
yarn test:watch
```
