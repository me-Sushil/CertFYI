"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NONCE_COOKIE_OPTIONS = exports.NONCE_MAX_AGE_SECONDS = exports.NONCE_COOKIE = exports.SESSION_COOKIE_OPTIONS = exports.SESSION_MAX_AGE_SECONDS = exports.SESSION_COOKIE = exports.SESSION_ROLES = void 0;
exports.isAdminWallet = isAdminWallet;
exports.SESSION_ROLES = ['ADMIN', 'ISSUER', 'UNAPPROVED'];
exports.SESSION_COOKIE = 'certfyi_session';
exports.SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
exports.SESSION_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: exports.SESSION_MAX_AGE_SECONDS * 1000,
};
exports.NONCE_COOKIE = 'siwe_nonce';
exports.NONCE_MAX_AGE_SECONDS = 60 * 5;
exports.NONCE_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: exports.NONCE_MAX_AGE_SECONDS * 1000,
};
function isAdminWallet(address) {
    const adminWallet = process.env.ADMIN_WALLET_ADDRESS;
    if (!adminWallet)
        return false;
    return address.toLowerCase() === adminWallet.toLowerCase();
}
//# sourceMappingURL=roles.constant.js.map