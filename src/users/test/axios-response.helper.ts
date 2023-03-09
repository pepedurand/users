import { HttpStatus } from '@nestjs/common';
export const axiosResponse = (
  status: HttpStatus,
  data: any,
  statusText: string,
): any => {
  return {
    config: {},
    data,
    headers: {},
    request: undefined,
    status,
    statusText,
  };
};
