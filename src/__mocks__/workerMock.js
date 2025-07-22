// src/__mocks__/workerMock.js
// This file mocks the Web Worker for Jest tests.

class Worker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = () => {};
  }

  postMessage(msg) {
    // You can add logic here to simulate the worker's response if needed
  }

  terminate() {
    // Mock terminate
  }
}

export default Worker;
