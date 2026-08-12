// Polyfill for Node 18
if (!Array.prototype.toReversed) {
  Object.defineProperty(Array.prototype, 'toReversed', {
    value: function() {
      return [...this].reverse();
    },
    configurable: true,
    writable: true,
    enumerable: false
  });
}

// Start expo cli
require('expo/bin/cli');
