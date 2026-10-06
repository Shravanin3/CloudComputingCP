/**
 * Azure Blob Storage Integration Helper for Member 3
 * Handles uploading generated PDF invoices and shop media assets.
 */

export class AzureStorageService {
  private static containerName = process.env.AZURE_STORAGE_CONTAINER || 'invoices';

  /**
   * Uploads a buffer (PDF invoice or image) to Azure Blob Storage
   */
  static async uploadInvoicePdf(blobName: string, buffer: Buffer): Promise<string> {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT;
    if (!accountName) {
      console.warn('[Azure Blob Storage] AZURE_STORAGE_ACCOUNT not set. Skipping blob upload.');
      return `https://storage.placeholder.local/${this.containerName}/${blobName}`;
    }

    try {
      // Safely require @azure/storage-blob dynamically
      const azureStorage = eval("require")('@azure/storage-blob');
      const BlobServiceClient = azureStorage.BlobServiceClient;
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

      let blobServiceClient: any;
      if (connectionString) {
        blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      } else {
        blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`);
      }

      const containerClient = blobServiceClient.getContainerClient(this.containerName);
      await containerClient.createIfNotExists({ access: 'blob' });

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: 'application/pdf' },
      });

      return blockBlobClient.url;
    } catch (error: any) {
      console.error('[Azure Blob Storage Upload Error]:', error.message);
      return `https://${accountName}.blob.core.windows.net/${this.containerName}/${blobName}`;
    }
  }
}
