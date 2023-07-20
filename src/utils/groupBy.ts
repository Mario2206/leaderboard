/**
 * Group an array by a given quantity
 */
export const groupBy = <T>(array: T[], qty: number): T[][] => {
  return array.reduce((acc, score, index) => {
    if (index % qty === 0) {
      acc.push([]);
    }
    acc[acc.length - 1].push(score);
    return acc;
  }, []);
};
