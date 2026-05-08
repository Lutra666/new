const {
  toNum,
  normalizeItems,
  calcAmount,
  toQtyMap,
  mergeDiffMap,
} = require('../shared/orderHelpers');

describe('toNum', () => {
  it('converts string to number', () => {
    expect(toNum('42')).toBe(42);
  });

  it('returns 0 for undefined/null', () => {
    expect(toNum(undefined)).toBe(0);
    expect(toNum(null)).toBe(0);
  });

  it('returns NaN for non-numeric strings', () => {
    expect(Number.isNaN(toNum('abc'))).toBe(true);
  });
});

describe('normalizeItems', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeItems(null)).toEqual([]);
    expect(normalizeItems(undefined)).toEqual([]);
    expect(normalizeItems({})).toEqual([]);
  });

  it('filters out items with no productName', () => {
    const input = [{ productName: '', quantity: 1, unitPrice: 10 }];
    expect(normalizeItems(input)).toEqual([]);
  });

  it('filters out items with zero quantity', () => {
    const input = [{ productName: '商品A', quantity: 0, unitPrice: 10 }];
    expect(normalizeItems(input)).toEqual([]);
  });

  it('normalizes valid items', () => {
    const input = [
      { product: '商品A', quantity: '2', unitPrice: '10' },
      { productName: '商品B', quantity: 3, unitPrice: 15 },
    ];
    const result = normalizeItems(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ productName: '商品A', quantity: 2, unitPrice: 10 });
    expect(result[1]).toEqual({ productName: '商品B', quantity: 3, unitPrice: 15 });
  });
});

describe('calcAmount', () => {
  it('calculates total from items', () => {
    const items = [
      { productName: 'A', quantity: 2, unitPrice: 10 },
      { productName: 'B', quantity: 3, unitPrice: 15 },
    ];
    expect(calcAmount(items)).toBe(65); // 2*10 + 3*15
  });

  it('returns 0 for empty items', () => {
    expect(calcAmount([])).toBe(0);
  });
});

describe('toQtyMap', () => {
  it('aggregates quantities by product name', () => {
    const items = [
      { productName: 'A', quantity: 2, unitPrice: 10 },
      { productName: 'A', quantity: 3, unitPrice: 10 },
      { productName: 'B', quantity: 5, unitPrice: 15 },
    ];
    const map = toQtyMap(items);
    expect(map.get('A')).toBe(5);
    expect(map.get('B')).toBe(5);
  });
});

describe('mergeDiffMap', () => {
  it('calculates difference with positive direction (purchases)', () => {
    const before = new Map([['A', 10], ['B', 5]]);
    const after = new Map([['A', 15], ['B', 5], ['C', 3]]);
    const diff = mergeDiffMap(before, after, 1);
    expect(diff.get('A')).toBe(5);  // 15 - 10
    expect(diff.has('B')).toBe(false); // no change
    expect(diff.get('C')).toBe(3);  // 3 - 0
  });

  it('calculates difference with negative direction (sales)', () => {
    const before = new Map([['A', 10]]);
    const after = new Map([['A', 3]]);
    const diff = mergeDiffMap(before, after, -1);
    expect(diff.get('A')).toBe(7); // 10 - 3
  });
});
