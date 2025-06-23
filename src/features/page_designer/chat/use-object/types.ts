export interface DBMessage {
  contentPreview?: string;
  data?: string;
  hasFile?: boolean;
  model?: string;
  prompt: string;
  response: string;
  timestamp?: number;
  // Commenting out attachments for now since Files can't be stored in DB
  // The file handling functionality can be revisited later when we have a proper solution for file storage.
  // attachments?: File[];
}
