module.exports = {
  forEachPromise(items, fn, context) {
    return items.reduce(
      (promise, item) => promise.then(() => fn(item, context)),
      Promise.resolve()
    );
  }
};
