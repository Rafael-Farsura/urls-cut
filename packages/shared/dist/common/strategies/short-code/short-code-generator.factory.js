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
exports.ShortCodeGeneratorFactory = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const hash_based_generator_1 = require("./hash-based.generator");
const random_generator_1 = require("./random.generator");
let ShortCodeGeneratorFactory = class ShortCodeGeneratorFactory {
    constructor(configService, hashBasedGenerator, randomGenerator) {
        this.configService = configService;
        this.hashBasedGenerator = hashBasedGenerator;
        this.randomGenerator = randomGenerator;
    }
    create() {
        const strategy = this.configService.get('app.shortCodeStrategy') || 'hash';
        switch (strategy) {
            case 'hash':
                return this.hashBasedGenerator;
            case 'random':
                return this.randomGenerator;
            default:
                return this.hashBasedGenerator;
        }
    }
};
exports.ShortCodeGeneratorFactory = ShortCodeGeneratorFactory;
exports.ShortCodeGeneratorFactory = ShortCodeGeneratorFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        hash_based_generator_1.HashBasedGenerator,
        random_generator_1.RandomGenerator])
], ShortCodeGeneratorFactory);
//# sourceMappingURL=short-code-generator.factory.js.map