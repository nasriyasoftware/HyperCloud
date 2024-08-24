# Server Uploads
This documentation covers the essential details of the `Uploads` module and its components, providing clarity on configuration, usage, and handling of form data.

## Overview

The `Uploads` module in the `HyperCloudServer` class provides a robust mechanism for handling file uploads. It allows developers to manage and configure various aspects of file uploads, such as setting file size limits for different types of files (images, videos, etc.), specifying upload directories, and handling MIME type-specific limits.

This document provides an overview of the module, detailing its features, usage examples, and configuration options.

Access the uploads module:
```js
server.uploads
```

## Features

- **Flexible File Size Limits:** Configure maximum file size limits for different types of files (images, videos, etc.) and specific MIME types.
- **Dynamic Directory Management:** Automatically create the upload directory if it doesn't exist.
- **Streamlined Upload Handling:** Use a file stream limit to manage memory usage efficiently by determining when uploads are stored in a stream rather than in memory.
- **MIME Type-Specific Limits:** Set and retrieve file size limits based on specific MIME types.

## Configuration Options

### `maxFileSize`

- **Type:** `number | StorageSize`
- **Default:** `100MB`
- **Description:** Sets the maximum allowed file size for uploads. It can be specified either as a number representing bytes or as an object with `value` and `unit` (e.g., `{ value: 10, unit: 'MB' }`).

### `directory`

- **Type:** `string`
- **Default:** `temp/uploads`
- **Description:** Specifies the directory where uploads are stored. If the directory does not exist, it is automatically created.

### `limits`

- **Type:** `UploadLimits`
- **Description:** Provides access to methods for setting and retrieving file size limits for different types of files and specific MIME types.

___
## Usage

### Setting File Size Limits

You can set the maximum allowed file size for images, videos, and specific MIME types using the `limits` property of the `Uploads` instance.

```js
// Set the maximum file size for images to 10 MB
server.uploads.limits.images = { value: 10, unit: 'MB' };

// Set the maximum file size for videos to 10485760 bytes (10 MB)
server.uploads.limits.videos = 10485760;

// Set a specific limit for a MIME type
server.uploads.limits.mime.set('application/pdf', { value: 5, unit: 'MB' });
```

### Retrieving File Size Limits
You can retrieve the current maximum file size for images, videos, or specific MIME types:

```js
const maxImageSize = server.uploads.limits.images;
const maxVideoSize = server.uploads.limits.videos;
const pdfLimit = server.uploads.limits.mime.get('application/pdf');
```

### Directory Management
The upload directory can be configured using the directory property. The directory is created automatically if it does not exist.

```js
server.uploads.directory = '/path/to/uploads';
```
___
## Example
### Processing Form Data
Handles incoming multipart form data for file uploads. This method processes the form data in an HTTP request, manages the upload process, and includes a `cleanup` function in the request `body` to handle temporary files after processing.

```ts
router.post('/api/v1/uploads', async (request, response, next) => {
    try {
        // Process the form data and handle the files
        await request.processFormData(response);

        // Extract fields, files, and the cleanup function from the request body
        const { fields, files, cleanup } = request.body as FormDataBody;

        // Process the files and fields (e.g., store files, update database)
        // ............................

        // Clean up temporary files after processing
        await cleanup();

        // Return a response or proceed to the next middleware/handler
        next();
    } catch(error) {
        response.status(500).json(error);
    }    
});
```

#### Parameters

- **`response`**: 
  - **Type**: `HyperCloudResponse`
  - **Description**: The response object used to send responses back to the client.

#### Returns

- **Type**: `Promise<void>`
- **Description**: A promise that resolves when the form data has been processed. The cleanup function is included in the request body and should be called after processing the files.

#### Throws

- **`Error`**: If an error occurs during form data processing, the response will send a 500 status with an error message, and the error will be re-thrown.

#### `FormDataBody` Interface
Represents the body of a request after processing form data. It includes fields and files from the form data, as well as a cleanup function.

#### Properties

- **`fields`**: 
  - **Type**: `Record<string, string>`
  - **Description**: Contains form fields and their values extracted from the form data.

- **`files`**: 
  - **Type**: `(FormDataMemoryFile | FormDataStorageFile)[]`
  - **Description**: An array of files uploaded through the form. Includes both memory files and storage files.

- **`cleanup`**: 
  - **Type**: `UploadCleanUpFunction`
  - **Description**: A function to clean up temporary files after processing. Should be called after files have been processed, such as copying them to a permanent location or storing their metadata.
