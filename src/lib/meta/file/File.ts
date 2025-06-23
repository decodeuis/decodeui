import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/pages/settings/constants";

export const parentDirectory: FieldAttribute = {
  // TODO: Display Tree Information in options.
  collection: "g:'Folder'",
  componentName: "Select",
  displayName: "Parent Folder",
  key: "ParentFolder",
  type: "ParentFolder",
  validation: { required: true },
};

export const File: IFormMetaData = {
  attributes: [
    // The key of the file as it was uploaded, including the file extension (e.g., document.pdf).
    {
      componentName: "SystemTextInput",
      displayName: "File Name",
      key: "fileName",
    },
    // The size of the file in bytes, kilobytes, megabytes, etc.
    {
      componentName: "NumberBox",
      disabled: true,
      displayName: "File Size (bytes)",
      key: "fileSize",
    },
    // The MIME type of the file (e.g., image/jpeg, application/pdf). This helps in identifying the file format and handling it appropriately.
    {
      componentName: "SystemTextInput",
      disabled: true,
      displayName: "File Type",
      key: "fileType",
    },
    // The date and time when the file was uploaded. This can help track the age of files and manage storage space.
    {
      componentName: "DateBox",
      disabled: true,
      displayName: "Upload Date",
      key: "uploadDate",
    },
    // Information about the user who uploaded the file, such as a user ID or username.
    {
      componentName: "SystemTextInput",
      disabled: true,
      displayName: "Uploader",
      key: "uploader",
    },
    // The location of the file in your storage system, which could be a file path (for on-premises storage) or a URL (for cloud storage).
    // {
    //   componentName: "SystemTextInput",
    //   disabled: true,
    //   displayName: "File Path",
    //   key: "filePath",
    // },
    // A brief description or notes about the file, which can provide context or additional details.
    {
      css: PROPERTIES.Css.TextFieldCss,
      componentName: "SystemTextInput",
      type: "textarea",
      displayName: "Description",
      key: "description",
    },
    // A checksum or hash value (e.g., MD5, SHA-256) for verifying the file's integrity. This can ensure the file hasn't been altered or corrupted.
    // {
    //   componentName: "SystemTextInput",
    //   disabled: true,
    //   displayName: "Checksum",
    //   key: "checksum",
    // },
    // Tags or categories assigned to the file, which can help in organizing and searching files.
    {
      componentName: "MultiSelect",
      disabled: true,
      displayName: "Tags",
      key: "tags",
    },
    // If your system supports versioning, this would indicate the version of the file.
    {
      componentName: "NumberBox",
      disabled: true,
      displayName: "Version",
      key: "version",
    },
    // A URL to a thumbnail image for visual files (e.g., images, videos). This can be used for quick previews.
    {
      componentName: "SystemTextInput",
      disabled: true,
      displayName: "Thumbnail URL",
      key: "thumbnailUrl",
    },
    // If applicable, an expiration date for temporary files, after which they may be automatically deleted.
    {
      componentName: "DateBox",
      disabled: true,
      displayName: "Expiration Date",
      key: "expirationDate",
    },
    parentDirectory,
  ],
  isInlineEditable: true,
  key: "File",
  title: "File",
};
export const Folder: IFormMetaData = {
  attributes: [
    // The key of the directory.
    {
      componentName: "SystemTextInput",
      displayName: "Directory Name",
      key: "key",
    },
    // The date and time when the directory was created.
    {
      componentName: "DateBox",
      disabled: true,
      displayName: "Creation Date",
      key: "creationDate",
    },
    // Information about the user who created the directory.
    {
      componentName: "SystemTextInput",
      disabled: true,
      displayName: "Creator",
      key: "creator",
    },
    // The location of the directory in your storage system.
    {
      componentName: "SystemTextInput",
      disabled: true,
      displayName: "Directory Path",
      key: "directoryPath",
    },
    // A brief description or notes about the directory.
    {
      css: PROPERTIES.Css.TextFieldCss,
      componentName: "SystemTextInput",
      type: "textarea",
      displayName: "Description",
      key: "description",
    },
    // Tags or categories assigned to the directory.
    { componentName: "MultiSelect", displayName: "Tags", key: "fileTag" },
    // The number of files in the directory.
    {
      componentName: "NumberBox",
      disabled: true,
      displayName: "File Count",
      key: "fileCount",
    },
    parentDirectory,
  ],
  isInlineEditable: true,
  key: "Folder",
  title: "Folder",
};

export const FileTag: IFormMetaData = {
  attributes: [
    // The key of the tag.
    {
      componentName: "SystemTextInput",
      displayName: "Tag Name",
      key: "key",
    },
    // A brief description or notes about the tag.
    {
      css: PROPERTIES.Css.TextFieldCss,
      componentName: "SystemTextInput",
      type: "textarea",
      displayName: "Description",
      key: "description",
    },
    // The date and time when the tag was created.
    {
      componentName: "DateBox",
      disabled: true,
      displayName: "Creation Date",
      key: "creationDate",
    },
    // Information about the user who created the tag.
    {
      componentName: "SystemTextInput",
      disabled: true,
      displayName: "Creator",
      key: "creator",
    },
  ],
  isInlineEditable: false,
  key: "FileTag",
  title: "File Tag",
};
