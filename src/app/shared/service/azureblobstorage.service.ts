import { Injectable } from '@angular/core';
import {
  BlobDownloadResponseModel,
  BlobServiceClient,
  ContainerClient,
} from '@azure/storage-blob';

@Injectable({
  providedIn: 'root',
})
export class AzureBlobStorageService {
  public account = 'storagedeepdiveapp';
  //registerdocumentsContainer = 'registerdocuments';
  //excursiondocumentsContainer = 'excursions';
  public sasRegisterDocuments: string =
    'sp=racwdli&st=2024-02-15T10:20:54Z&se=2025-02-15T18:20:54Z&spr=https&sv=2022-11-02&sr=c&sig=3CTdqoVQHESAhL%2FJMiDlQHhowGap9huql%2FJ%2BZ4W8f5Y%3D';

  public sasExcursions: string =
    'sp=racwdli&st=2024-03-20T17:32:17Z&se=2025-07-18T00:32:17Z&spr=https&sv=2022-11-02&sr=c&sig=UmTBIIK%2FHDmEHKaLpw97upUfA9hZHKgk3XA%2BrYiaEVE%3D';

  public async uploadFileWithProgress(
    content: File,
    container: string,
    name: string,
    progressCallback: (progress: number) => void,
    successCallback: () => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errorCallback: (error: any) => void
  ): Promise<void> {
    let url: string = '';

    if (container === 'excursions') {
      url = this.sasExcursions;
    }
    if (container === 'registerdocuments') {
      url = this.sasRegisterDocuments;
    }

    const blobServiceClient = new BlobServiceClient(
      `https://${this.account}.blob.core.windows.net?${url}`
    );

    const containerClient = blobServiceClient.getContainerClient(container);
    const blockBlobClient = containerClient.getBlockBlobClient(name);

    try {
      await blockBlobClient.uploadBrowserData(content, {
        blockSize: 1024 * 64,
        blobHTTPHeaders: {
          blobContentType: content.type,
        },
        onProgress: progressEvent => {
          const progress = (progressEvent.loadedBytes / content.size) * 100;
          progressCallback(progress);
        },
      });
      successCallback();
    } catch (error) {
      errorCallback(error);
    }
  }

  public uploadFile(
    content: Blob,
    container: string,
    name: string,
    handler: () => void
  ) {
    this.uploadBlob(content, name, this.containerClient(container), handler);
  }

  public downloadFile(
    name: string,
    container: string,
    handler: (blob: Blob) => void
  ) {
    this.downloadBlob(name, this.containerClient(container), handler);
  }

  private uploadBlob(
    content: Blob,
    name: string,
    client: ContainerClient,
    handler: () => void
  ) {
    const blockBlobClient = client.getBlockBlobClient(name);
    blockBlobClient
      .uploadData(content, {
        blobHTTPHeaders: { blobContentType: content.type },
      })
      .then(() => handler());
  }

  public deleteFile(name: string, container: string, handler: () => void) {
    this.deleteBlob(name, this.containerClient(container), handler);
  }

  private downloadBlob(
    name: string,
    client: ContainerClient,
    handler: (blob: Blob) => void
  ) {
    const blobClient = client.getBlobClient(name);
    blobClient
      .download()
      .then((resp: BlobDownloadResponseModel) => {
        if (resp.blobBody) {
          resp.blobBody.then(blob => {
            handler(blob);
          });
        } else {
          console.error('Blob body is undefined.');
        }
      })
      .catch(error => {
        console.error('Error downloading blob:', error);
      });
  }

  private deleteBlob(
    name: string,
    client: ContainerClient,
    handler: () => void
  ) {
    client.deleteBlob(name).then(() => {
      handler();
    });
  }

  private containerClient(container: string): ContainerClient {
    if (container === 'excursions') {
      return new BlobServiceClient(
        `https://${this.account}.blob.core.windows.net?${this.sasExcursions}`
      ).getContainerClient(container);
    }
    if (container === 'registerdocuments') {
      return new BlobServiceClient(
        `https://${this.account}.blob.core.windows.net?${this.sasRegisterDocuments}`
      ).getContainerClient(container);
    }
    throw new Error(`Unsupported container: ${container}`);
  }
}
