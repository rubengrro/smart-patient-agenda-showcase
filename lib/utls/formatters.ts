export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")
}