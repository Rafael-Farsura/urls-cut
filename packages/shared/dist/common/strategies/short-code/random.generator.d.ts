import { IShortCodeGenerator } from './short-code-generator.interface';
import { ConfigService } from '@nestjs/config';
export declare class RandomGenerator implements IShortCodeGenerator {
    private readonly configService;
    private readonly codeLength;
    private readonly base62Chars;
    constructor(configService: ConfigService);
    generate(_originalUrl: string): string;
}
