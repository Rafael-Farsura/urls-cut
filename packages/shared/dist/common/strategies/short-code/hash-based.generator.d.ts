import { IShortCodeGenerator } from './short-code-generator.interface';
import { ConfigService } from '@nestjs/config';
export declare class HashBasedGenerator implements IShortCodeGenerator {
    private readonly configService;
    private readonly codeLength;
    constructor(configService: ConfigService);
    generate(originalUrl: string): string;
}
