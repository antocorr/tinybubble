# Bubble test workspace

This folder is an isolated test project so the main library dependencies stay untouched.

## Install

```bash
npm --prefix tests install
```

## Run tests

```bash
npm --prefix tests run test
```

## Watch mode

```bash
npm --prefix tests run test:watch
```

Tests import Bubble directly from `../src`.
