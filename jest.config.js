module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jsdom'
};
