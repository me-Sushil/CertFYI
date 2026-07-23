"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionGuard = void 0;
const common_1 = require("@nestjs/common");
const roles_constant_1 = require("../constants/roles.constant");
const session_token_1 = require("../session/session-token");
let SessionGuard = class SessionGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = request.cookies?.[roles_constant_1.SESSION_COOKIE];
        if (!token) {
            throw new common_1.UnauthorizedException('Authentication required');
        }
        const session = await (0, session_token_1.verifySessionToken)(token);
        if (!session) {
            throw new common_1.UnauthorizedException('Authentication required');
        }
        request.session = session;
        return true;
    }
};
exports.SessionGuard = SessionGuard;
exports.SessionGuard = SessionGuard = __decorate([
    (0, common_1.Injectable)()
], SessionGuard);
//# sourceMappingURL=session.guard.js.map