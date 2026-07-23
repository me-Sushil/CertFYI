"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsQueryDto = exports.RejectUserDto = exports.ApproveUserDto = void 0;
const class_validator_1 = require("class-validator");
class ApproveUserDto {
}
exports.ApproveUserDto = ApproveUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' }),
    __metadata("design:type", String)
], ApproveUserDto.prototype, "walletAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{64}$/, { message: 'Invalid transaction hash' }),
    __metadata("design:type", String)
], ApproveUserDto.prototype, "txHash", void 0);
class RejectUserDto {
}
exports.RejectUserDto = RejectUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum wallet address' }),
    __metadata("design:type", String)
], RejectUserDto.prototype, "walletAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectUserDto.prototype, "reason", void 0);
class RequestsQueryDto {
}
exports.RequestsQueryDto = RequestsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ALL', 'PENDING', 'APPROVED', 'REJECTED']),
    __metadata("design:type", String)
], RequestsQueryDto.prototype, "status", void 0);
//# sourceMappingURL=admin.dto.js.map