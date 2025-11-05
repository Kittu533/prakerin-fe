
export interface MetaData {
  message: string;
  code: number;
}

export interface ResponseApi<T= any> {
  message: string;
  processId: string;
  metadata: MetaData;
  metaData: MetaData;
  response: T;
}
