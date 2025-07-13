import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Set up Canvas for jsdom
import { createCanvas } from 'canvas';

// Mock canvas if needed for RoughJS
global.HTMLCanvasElement.prototype.getContext = function(contextType) {
  if (contextType === '2d') {
    const canvas = createCanvas(this.width || 300, this.height || 150);
    return canvas.getContext('2d');
  }
  return null;
};

// Mock getBoundingClientRect for tests
global.Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 300,
  height: 150,
  top: 0,
  left: 0,
  bottom: 150,
  right: 300,
  x: 0,
  y: 0,
  toJSON: jest.fn()
}));

// Mock devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 1,
});

// Set up TextEncoder/TextDecoder for Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
