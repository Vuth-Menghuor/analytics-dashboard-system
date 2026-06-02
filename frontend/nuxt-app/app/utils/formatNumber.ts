export const formatNumber = (value: number) => {
  return new Intl.NumberFormat().format(value);
};
