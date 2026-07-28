"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermanentIpfsError = void 0;
exports.isValidCid = isValidCid;
exports.buildGatewayUrl = buildGatewayUrl;
exports.sanitizeFilename = sanitizeFilename;
exports.formatBytes = formatBytes;
exports.isRetryableStatus = isRetryableStatus;
exports.withRetry = withRetry;
const ipfs_constants_1 = require("./ipfs.constants");
const CID_V0 = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
const CID_V1 = /^b[a-z2-7]{58,}$/;
function isValidCid(cid) {
    if (!cid)
        return false;
    return CID_V0.test(cid) || CID_V1.test(cid);
}
function buildGatewayUrl(gatewayBase, cid) {
    const base = gatewayBase.replace(/\/+$/, '');
    const withPath = base.endsWith('/ipfs') ? base : `${base}/ipfs`;
    return `${withPath}/${cid}`;
}
function sanitizeFilename(filename, fallback = 'file') {
    const cleaned = filename
        .replace(/[/\\]/g, '_')
        .replace(/[\x00-\x1f\x7f]/g, '')
        .trim();
    return cleaned.length > 0 ? cleaned.slice(0, 255) : fallback;
}
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
class PermanentIpfsError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'PermanentIpfsError';
    }
}
exports.PermanentIpfsError = PermanentIpfsError;
function isRetryableStatus(status) {
    if (status === 408 || status === 429)
        return true;
    return status >= 500;
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function withRetry(fn, options = {}) {
    const attempts = options.attempts ?? ipfs_constants_1.IPFS_MAX_ATTEMPTS;
    const baseDelayMs = options.baseDelayMs ?? ipfs_constants_1.IPFS_RETRY_BASE_DELAY_MS;
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (error instanceof PermanentIpfsError || attempt === attempts) {
                throw error;
            }
            const backoff = baseDelayMs * 2 ** (attempt - 1);
            const delayMs = backoff + Math.floor(Math.random() * baseDelayMs);
            options.onRetry?.(attempt, error, delayMs);
            await sleep(delayMs);
        }
    }
    throw lastError;
}
//# sourceMappingURL=ipfs.utils.js.map