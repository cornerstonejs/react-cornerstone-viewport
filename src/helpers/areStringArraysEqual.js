/**
 * Compare equality of two string arrays.
 *
 * @param {string[]} [arr1] - String array #1
 * @param {string[]} [arr2] - String array #2
 * @returns {boolean}
 */
export default function areStringArraysEqual(arr1, arr2) {
  if (arr1 === arr2) return true; // Identity
  if (!arr1 || !arr2) return false; // One is undef/null
  if (arr1.length !== arr2.length) return false; // Diff length

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
}
