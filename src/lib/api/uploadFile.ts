export async function uploadFile(file: File, apiUrl: string, method = "POST") {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(apiUrl, {
      body: formData,
      method,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error("There was a problem with the file upload:", error);
    throw error;
  }
}
