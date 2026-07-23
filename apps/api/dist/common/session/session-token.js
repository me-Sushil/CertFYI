"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSessionToken = createSessionToken;
exports.verifySessionToken = verifySessionToken;
const jose_1 = require("jose");
const roles_constant_1 = require("../constants/roles.constant");
function getSecretKey() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return new TextEncoder().encode(secret);
}
async function createSessionToken(payload) {
    return new jose_1.SignJWT({ address: payload.address, role: payload.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${roles_constant_1.SESSION_MAX_AGE_SECONDS}s`)
        .sign(getSecretKey());
}
async function verifySessionToken(token) {
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, getSecretKey());
        if (typeof payload.address !== 'string' || typeof payload.role !== 'string') {
            return null;
        }
        if (!['ADMIN', 'ISSUER', 'UNAPPROVED'].includes(payload.role)) {
            return null;
        }
        return { address: payload.address, role: payload.role };
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=session-token.js.map