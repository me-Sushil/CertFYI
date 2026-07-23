import { type SessionPayload } from '../constants/roles.constant';
export declare function createSessionToken(payload: SessionPayload): Promise<string>;
export declare function verifySessionToken(token: string): Promise<SessionPayload | null>;
