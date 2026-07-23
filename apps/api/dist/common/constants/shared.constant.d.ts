export declare const APP_NAME = "CertFyi";
export declare const APP_DESCRIPTION = "Web3 Document Verification Platform";
export declare const APP_URL: string;
export declare const API_URL: string;
export declare const SUPPORTED_CHAINS: {
    id: number;
    name: string;
}[];
export declare const RPC_URLS: {
    1: string;
    137: string;
    42161: string;
    8453: string;
    10: string;
};
export declare const CONTRACT_ADDRESSES: {
    documentAnchor: string;
    issuerRegistry: string;
};
export declare const ISSUER_STATUS: {
    readonly PENDING: "pending";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
};
export declare const REQUEST_STATUS: {
    readonly NONE: "NONE";
    readonly PENDING: "PENDING";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
};
export declare const DOCUMENT_STATUS: {
    readonly ISSUED: "issued";
    readonly REVOKED: "revoked";
    readonly EXPIRED: "expired";
};
export declare const API_ENDPOINTS: {
    readonly ISSUER_REGISTER: "/api/issuer/register";
    readonly ISSUER_STATUS: "/api/issuer/status";
    readonly ISSUER_APPROVE: "/api/issuer/approve";
    readonly DOCUMENT_ANCHOR: "/api/documents/anchor";
    readonly DOCUMENT_ANCHOR_BATCH: "/api/documents/anchor-batch";
    readonly DOCUMENT_VERIFY: "/api/documents/verify";
    readonly PDF_UPLOAD: "/api/pdf/upload";
};
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
export declare const VALIDATION: {
    readonly MIN_NAME_LENGTH: 2;
    readonly MIN_EMAIL_LENGTH: 5;
    readonly MIN_DESCRIPTION_LENGTH: 10;
    readonly MAX_DESCRIPTION_LENGTH: 1000;
    readonly ETH_ADDRESS_REGEX: RegExp;
    readonly HASH_REGEX: RegExp;
};
export declare const IS_PRODUCTION: boolean;
export declare const IS_DEVELOPMENT: boolean;
export declare const IS_TEST: boolean;
