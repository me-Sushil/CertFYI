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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const documents_service_1 = require("./documents.service");
const documents_dto_1 = require("../common/dto/documents.dto");
let DocumentsController = class DocumentsController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    anchor(body) {
        return this.documentsService.anchor(body);
    }
    getAnchor(hash) {
        return this.documentsService.getAnchor(hash);
    }
    anchorBatch(body) {
        return this.documentsService.anchorBatch(body);
    }
    getBatch(batchId) {
        return this.documentsService.getBatch(batchId);
    }
    verify(body) {
        return this.documentsService.verify(body.documentHash, body.pdfContent);
    }
    quickVerify(hash) {
        return this.documentsService.quickVerify(hash);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('anchor'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [documents_dto_1.AnchorDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "anchor", null);
__decorate([
    (0, common_1.Get)('anchor'),
    __param(0, (0, common_1.Query)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getAnchor", null);
__decorate([
    (0, common_1.Post)('anchor-batch'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [documents_dto_1.BatchAnchorDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "anchorBatch", null);
__decorate([
    (0, common_1.Get)('anchor-batch'),
    __param(0, (0, common_1.Query)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getBatch", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [documents_dto_1.VerifyDocumentDto]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "verify", null);
__decorate([
    (0, common_1.Get)('verify'),
    __param(0, (0, common_1.Query)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "quickVerify", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map