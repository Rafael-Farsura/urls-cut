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
exports.RandomGenerator = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
let RandomGenerator = class RandomGenerator {
    constructor(configService) {
        this.configService = configService;
        this.base62Chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.codeLength = this.configService.get('app.shortCodeLength') || 6;
    }
    generate(_originalUrl) {
        const bytes = (0, crypto_1.randomBytes)(this.codeLength);
        let code = '';
        for (let i = 0; i < this.codeLength; i++) {
            code += this.base62Chars[bytes[i] % 62];
        }
        return code;
    }
};
exports.RandomGenerator = RandomGenerator;
exports.RandomGenerator = RandomGenerator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RandomGenerator);
//# sourceMappingURL=random.generator.js.map