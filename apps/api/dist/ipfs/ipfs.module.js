"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpfsModule = void 0;
const common_1 = require("@nestjs/common");
const ipfs_controller_1 = require("./ipfs.controller");
const ipfs_constants_1 = require("./ipfs.constants");
const ipfs_service_1 = require("./ipfs.service");
const pinata_provider_1 = require("./providers/pinata.provider");
let IpfsModule = class IpfsModule {
};
exports.IpfsModule = IpfsModule;
exports.IpfsModule = IpfsModule = __decorate([
    (0, common_1.Module)({
        controllers: [ipfs_controller_1.IpfsController],
        providers: [ipfs_service_1.IpfsService, { provide: ipfs_constants_1.IPFS_PROVIDER, useClass: pinata_provider_1.PinataProvider }],
        exports: [ipfs_service_1.IpfsService],
    })
], IpfsModule);
//# sourceMappingURL=ipfs.module.js.map