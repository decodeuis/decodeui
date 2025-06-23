export function getErrorMessage(res: any): string {
  if (!res) {
    return "No response received";
  }
  if (res.error) {
    return res.error;
  }
  if (res.statusCode === 500) {
    return "Internal server error";
  }
  if (res.message) {
    return res.message;
  }
  return "";
}
