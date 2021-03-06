# Chefling DI for JavaScript: Change Log

## [0.3.4](../../tree/v0.3.4) (2015-06-15)

- Fix: Uses correct global 'namespace' object - `window` for browsers, `global`
for Node.

## [0.3.3](../../tree/v0.3.3) (2015-06-15)

- Fix: Check whether 'window' exists before using it.

## [0.3.2](../../tree/v0.3.2) (2015-05-18)

- Distribution module (`/dist/chefling.js`) now returns Container function. This
allows for more flexible usage of the library.

## [0.3.1](../../tree/v0.3.1) (2015-05-12)

- Fix: When asked for a "Container", supply the current instance.

## [0.3.0](../../tree/v0.3.0) (2015-05-07)

- Introduces `Container.setLoader()`, a wrapper for a dependency loader such as
Node's / RequireJS's `require`.

## [0.2.0](../../tree/v0.2.0) (2015-05-07)

- Renames bower & npm package to just "chefling".

## [0.1.1](../../tree/v0.1.1) (2015-05-07)

- Distribution module (`/dist/chefling.js`) now returns default Container
instance.

## [0.1.0](../../tree/v0.1.0) (2015-05-07)

- First release.
