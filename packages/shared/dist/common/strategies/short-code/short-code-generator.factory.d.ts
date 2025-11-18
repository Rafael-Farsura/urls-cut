import { ConfigService } from '@nestjs/config';
import { IShortCodeGenerator } from './short-code-generator.interface';
import { HashBasedGenerator } from './hash-based.generator';
import { RandomGenerator } from './random.generator';
export declare class ShortCodeGeneratorFactory {
    private readonly configService;
    private readonly hashBasedGenerator;
    private readonly randomGenerator;
    constructor(configService: ConfigService, hashBasedGenerator: HashBasedGenerator, randomGenerator: RandomGenerator);
    create(): IShortCodeGenerator;
}
