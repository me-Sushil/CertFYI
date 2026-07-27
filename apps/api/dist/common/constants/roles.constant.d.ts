import type { CookieOptions } from 'express';
export declare const SESSION_ROLES: readonly ["ADMIN", "ISSUER", "UNAPPROVED"];
export type SessionRole = (typeof SESSION_ROLES)[number];
export interface SessionPayload {
    address: string;
    role: SessionRole;
}
export declare const SESSION_COOKIE = "certfyi_session";
export declare const SESSION_MAX_AGE_SECONDS: number;
export declare const SESSION_COOKIE_OPTIONS: CookieOptions;
export declare const NONCE_COOKIE = "siwe_nonce";
export declare const NONCE_MAX_AGE_SECONDS: number;
export declare const NONCE_COOKIE_OPTIONS: CookieOptions;
export declare function isAdminWallet(address: string): boolean;
