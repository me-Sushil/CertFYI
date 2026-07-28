export declare class ApiErrorDto {
    statusCode: number;
    message: string;
    error?: string;
}
export declare class ValidationErrorDto {
    statusCode: number;
    message: string[];
    error: string;
}
