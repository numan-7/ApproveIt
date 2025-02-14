function convertToLocalTime(
  dateString: string | Date,
  editing: boolean = false
) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export { convertToLocalTime };
