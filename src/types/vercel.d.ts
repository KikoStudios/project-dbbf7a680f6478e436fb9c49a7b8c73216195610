declare module '@vercel/blob' {
  export class BlobServiceClient {
    static fromConnectionString(connectionString: string): BlobServiceClient;
    getContainerClient(containerName: string): ContainerClient;
  }

  export class ContainerClient {
    getBlobClient(blobName: string): BlobClient;
  }

  export class BlobClient {
    download(): Promise<{
      text(): Promise<string>;
    }>;
  }

  export function put(
    pathname: string,
    body: string | Buffer,
    options?: {
      access?: 'public' | 'private';
      addRandomSuffix?: boolean;
      token?: string;
      contentType?: string;
    }
  ): Promise<{ url: string }>;

  export function del(
    pathname: string,
    options?: { token?: string }
  ): Promise<void>;
}

declare module '@vercel/node' {
  export interface VercelRequest extends Request {
    query: { [key: string]: string | string[] };
  }

  export interface VercelResponse extends Response {
    status(code: number): this;
    json(body: any): void;
    setHeader(name: string, value: string): this;
  }
} 