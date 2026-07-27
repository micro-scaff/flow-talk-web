function normalizeSearchValue(value: string): string {
  return value.trim().toLocaleLowerCase("zh-CN");
}

function sortCopy<T>(values: readonly T[], compare: (source: T, target: T) => number): T[] {
  const nextValues = [
    ...values
  ];

  // 当前 tsconfig 目标为 ES2022，复制后排序可避免直接修改接口返回数组。
  // eslint-disable-next-line unicorn/no-array-sort
  return nextValues.sort(compare);
}

export {
  normalizeSearchValue,
  sortCopy
};
