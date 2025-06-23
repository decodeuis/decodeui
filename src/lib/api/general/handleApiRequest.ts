import { postAPI } from "~/lib/api/general/postApi";

// for mutate use handleDataSubmission function.

// Common function to handle API requests
export async function handleApiRequest(
  url: string,
  data: any,
  successMessage: string,
  setLoading: (value: boolean) => void,
  showSuccessToast: (message: string) => void,
  showErrorToast: (message: string) => void,
  onSuccess?: () => void,
  onError?: (error: any) => void,
) {
  try {
    setLoading(true);
    const response = await postAPI(url, data);
    if (response.error) {
      showErrorToast(response.error);
      onError?.(response.error);
      return { response, success: false };
    }
    showSuccessToast(successMessage);
    onSuccess?.();
    return { response, success: true };
  } catch (error) {
    showErrorToast((error as Error).message);
    onError?.(error);
    return { error, success: false };
  } finally {
    setLoading(false);
  }
}
