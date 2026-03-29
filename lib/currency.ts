export function formatINR(value: number) {
  const rounded = Number(value);
  const display = Number.isInteger(rounded)
    ? rounded.toString()
    : rounded.toFixed(2).replace(/\.00$/, "");
  return `₹${display}`;
}

