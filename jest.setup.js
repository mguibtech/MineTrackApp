jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-fs', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  exists: jest.fn(),
  mkdir: jest.fn(),
  // Adicione outros métodos usados no seu código, se necessário
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() =>
    Promise.resolve({ isConnected: true, isInternetReachable: true }),
  ),
}));
