/**
 * Envelope de respuesta del backend — idéntico al que ya usa
 * BoxService_FrontEnd/web/types/api.ts. Mismo backend, mismo contrato,
 * dos apps distintas.
 */
export type ApiSuccess<T> = {
  success: true;
  data: T;
  error: null;
};

export type ApiError = {
  success: false;
  data: null;
  error: {
    code: number;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiSuccess<T>(res: ApiResponse<T>): res is ApiSuccess<T> {
  return res.success === true;
}
