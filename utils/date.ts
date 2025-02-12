function convertToLocalTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export { convertToLocalTime };
