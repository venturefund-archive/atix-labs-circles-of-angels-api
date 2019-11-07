function getDescriptors(instance, values, mockable = false) {
  // map property descriptors
  return Object.entries(values).reduce(
    (acc, [name, value]) =>
      Object.assign(acc, { [name]: {
        value: value,
        configurable: mockable
      } }),
    {}
  );
}
module.exports = {

  injectMocks(instance, mocks) {
    Object.defineProperties(instance, getDescriptors(instance, mocks, true));
  },
  injectDependencies(instance, dependencies) {
    Object.defineProperties(instance, getDescriptors(instance, dependencies));
  }
};
