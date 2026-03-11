/**
 * Performance optimization utilities
 */

import { InteractionManager } from 'react-native';

/**
 * Runs a callback after all interactions/animations have completed
 * This prevents blocking the main thread during animations
 */
export const runAfterInteractions = (callback) => {
  return InteractionManager.runAfterInteractions(callback);
};

/**
 * Debounce function to limit how often a function can fire
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to ensure a function is only called once per specified time period
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Batch AsyncStorage operations to reduce I/O overhead
 */
export const batchAsyncOperations = async (operations) => {
  return Promise.all(operations);
};

/**
 * Memoization helper for expensive computations
 */
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

