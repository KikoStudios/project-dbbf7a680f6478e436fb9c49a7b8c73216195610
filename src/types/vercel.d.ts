declare module '@vercel/blob' {
  export interface BlobResponse {
    url: string;
    text(): Promise<string>;
    json(): Promise<any>;
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

  export function get(
    pathname: string,
    options?: { token?: string }
  ): Promise<BlobResponse | null>;

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