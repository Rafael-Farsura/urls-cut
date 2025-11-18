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
exports.HashBasedGenerator = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
let HashBasedGenerator = class HashBasedGenerator {
    constructor(configService) {
        this.configService = configService;
        this.codeLength = this.configService.get('app.shortCodeLength') || 6;
    }
    generate(originalUrl) {
        const hash = (0, crypto_1.createHash)('sha256').update(originalUrl).digest('hex');
        const base62Chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let code = '';
        let hashIndex = 0;
        while (code.length < this.codeLength && hashIndex < hash.length) {
            const hexValue = parseInt(hash.substr(hashIndex, 2), 16);
            code += base62Chars[hexValue % 62];
            hashIndex += 2;
        }
        if (code.length < this.codeLength) {
            const remaining = this.codeLength - code.length;
            for (let i = 0; i < remaining; i++) {
                const hexValue = parseInt(hash.substr((hashIndex + i * 2) % hash.length, 2), 16);
                code += base62Chars[hexValue % 62];
            }
        }
        return code.substring(0, this.codeLength);
    }
};
exports.HashBasedGenerator = HashBasedGenerator;
exports.HashBasedGenerator = HashBasedGenerator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HashBasedGenerator);
//# sourceMappingURL=hash-based.generator.js.map