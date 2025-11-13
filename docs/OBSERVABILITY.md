# Observabilidade - URL Shortener

## Visão Geral

O sistema implementa instrumentação de observabilidade para monitoramento, debugging e análise de performance. A observabilidade pode ser ativada/desativada através de variáveis de ambiente.

## Componentes de Observabilidade

### 1. Logs

Registro estruturado de eventos e erros do sistema.

#### Configuração

```env
ENABLE_LOGGING=true
LOG_LEVEL=info  # error, warn, info, debug
```

#### Níveis de Log

- **error**: Erros críticos que impedem operação
- **warn**: Avisos sobre situações anômalas
- **info**: Informações gerais de operação
- **debug**: Detalhes para debugging

#### Formato

Logs estruturados em JSON para facilitar parsing:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "URL created",
  "context": "UrlsService",
  "userId": "uuid",
  "shortCode": "aZbKq7"
}
```

#### Implementação

- **Desenvolvimento**: Logs no console com cores
- **Produção**: Logs estruturados (JSON)
- **Integração**: Pode enviar para serviços como:
  - Elasticsearch
  - CloudWatch
  - Datadog Logs
  - Splunk

### 2. Métricas

Coleta de métricas de performance e uso do sistema.

#### Configuração

```env
ENABLE_METRICS=true
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
```

#### Métricas Coletadas

**HTTP:**
- Requisições por segundo (RPS)
- Tempo de resposta (latência)
- Taxa de erro
- Códigos de status HTTP

**Aplicação:**
- URLs criadas por minuto
- Cliques por minuto
- Usuários ativos
- Taxa de conversão (criação → clique)

**Sistema:**
- Uso de CPU
- Uso de memória
- Conexões de banco ativas
- Tamanho do pool de conexões

#### Endpoint de Métricas

```
GET /metrics
```

Retorna métricas no formato Prometheus.

#### Integração com Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'url-shortener'
    static_configs:
      - targets: ['localhost:9090']
```

### 3. Rastreamento (Tracing)

Rastreamento distribuído de requisições através do sistema.

#### Configuração

**OpenTelemetry/Jaeger:**
```env
ENABLE_TRACING=true
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6831
JAEGER_SERVICE_NAME=url-shortener
```

**Elastic APM:**
```env
ENABLE_TRACING=true
ELASTIC_APM_SERVER_URL=http://localhost:8200
ELASTIC_APM_SERVICE_NAME=url-shortener
ELASTIC_APM_ENVIRONMENT=production
```

#### Spans Rastreados

- Requisições HTTP completas
- Chamadas ao banco de dados
- Geração de código curto
- Validações
- Autenticação

#### Visualização

- **Jaeger UI**: `http://localhost:16686`
- **Elastic APM UI**: Acessível via Kibana

## Serviços Externos

### Sentry (Error Tracking)

Rastreamento de erros e exceções em produção.

#### Configuração

```env
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_ENABLED=true
SENTRY_ENVIRONMENT=production
```

#### Funcionalidades

- Captura automática de exceções
- Stack traces completos
- Contexto da requisição
- Breadcrumbs de eventos
- Alertas configuráveis

### Datadog (APM)

Monitoramento completo de aplicação e infraestrutura.

#### Configuração

```env
DATADOG_API_KEY=your-api-key
DATADOG_ENABLED=true
DATADOG_SERVICE=url-shortener
DATADOG_ENV=production
```

#### Funcionalidades

- APM distribuído
- Métricas customizadas
- Logs centralizados
- Dashboards
- Alertas

### Elastic APM

Solução de APM da Elastic Stack.

#### Configuração

```env
ELASTIC_APM_SERVER_URL=http://localhost:8200
ELASTIC_APM_ENABLED=true
ELASTIC_APM_SERVICE_NAME=url-shortener
ELASTIC_APM_ENVIRONMENT=production
```

#### Funcionalidades

- Rastreamento distribuído
- Métricas de performance
- Logs correlacionados
- Integração com Elasticsearch/Kibana

## Implementação

### Estrutura

```
src/
├── common/
│   ├── interceptors/
│   │   └── logging.interceptor.ts    # Logging de requisições
│   ├── filters/
│   │   └── http-exception.filter.ts  # Logging de erros
│   └── decorators/
│       └── metrics.decorator.ts      # Métricas customizadas
└── config/
    └── observability.config.ts       # Configuração centralizada
```

### Interceptor de Logging

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const responseTime = Date.now() - now;

        this.logger.log(
          `${method} ${url} ${statusCode} - ${responseTime}ms`,
        );
      }),
    );
  }
}
```

### Exception Filter

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Log erro
    // Enviar para Sentry se habilitado
    // Retornar resposta formatada
  }
}
```

## Ativação/Desativação

Todos os recursos de observabilidade podem ser ativados/desativados individualmente:

```env
# Desabilitar tudo
ENABLE_LOGGING=false
ENABLE_METRICS=false
ENABLE_TRACING=false

# Habilitar apenas logs
ENABLE_LOGGING=true
ENABLE_METRICS=false
ENABLE_TRACING=false
```

## Boas Práticas

1. **Desenvolvimento**: Logs detalhados, métricas e tracing desabilitados
2. **Staging**: Todos habilitados para testes
3. **Produção**: Todos habilitados com configuração adequada

## Custos

- **Logs**: Volume de dados armazenados
- **Métricas**: Número de métricas e frequência
- **Tracing**: Número de spans e retenção
- **Serviços Externos**: Depende do plano contratado

## Monitoramento Recomendado

### Alertas Críticos

- Taxa de erro > 5%
- Latência p95 > 1s
- Disponibilidade < 99.9%
- Erros de autenticação > 10/min

### Dashboards

- Visão geral do sistema
- Performance de endpoints
- Uso de recursos
- Tendências de uso

## Referências

- [NestJS Logging](https://docs.nestjs.com/techniques/logger)
- [OpenTelemetry](https://opentelemetry.io/)
- [Prometheus](https://prometheus.io/)
- [Jaeger](https://www.jaegertracing.io/)
- [Sentry](https://sentry.io/)
- [Datadog](https://www.datadoghq.com/)
- [Elastic APM](https://www.elastic.co/apm)

