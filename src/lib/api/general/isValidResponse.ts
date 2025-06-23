export function isValidResponse(res: any) {
  if (!res) {
    return false;
  }
  if (res.error) {
    return false;
  }
  if (res.statusCode === 500) {
    return false;
  }
  return true;
}
