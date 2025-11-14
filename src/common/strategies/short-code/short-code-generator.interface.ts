/**
 * Interface para estratégias de geração de código curto
 * Implementa Strategy Pattern para permitir diferentes algoritmos
 */
export interface IShortCodeGenerator {
  /**
   * Gera um código curto único baseado na URL original
   * @param originalUrl URL original a ser encurtada
   * @returns Código curto de 6 caracteres (alfanumérico)
   */
  generate(originalUrl: string): string;
}

