#!/bin/sh
# Script para gerar symmetric.json com o JWT_SECRET antes de iniciar KrakenD

# Verifica se JWT_SECRET está definido
if [ -z "$JWT_SECRET" ]; then
  if [ "$NODE_ENV" = "production" ]; then
    echo "❌ ERROR: JWT_SECRET is required in production environment" >&2
    echo "   Please set the JWT_SECRET environment variable." >&2
    echo "   Generate a secure secret: openssl rand -base64 32" >&2
    exit 1
  else
    # Em desenvolvimento, usa fallback seguro
    JWT_SECRET_VALUE="dev-secret-key-change-in-production-DO-NOT-USE-IN-PRODUCTION"
    echo "⚠️  WARNING: Using development JWT_SECRET fallback" >&2
    echo "   For production, set the JWT_SECRET environment variable." >&2
  fi
else
  JWT_SECRET_VALUE="$JWT_SECRET"
fi

# Gerar base64 do secret
if command -v base64 >/dev/null 2>&1; then
    SECRET_B64=$(echo -n "${JWT_SECRET_VALUE}" | base64)
else
    # Fallback: usar python se base64 não estiver disponível
    SECRET_B64=$(python3 -c "import base64; print(base64.b64encode('${JWT_SECRET_VALUE}'.encode()).decode())" 2>/dev/null || echo "")
fi

# Criar arquivo symmetric.json com o secret em base64
cat > /etc/krakend/symmetric.json <<EOF
{
  "keys": [
    {
      "kty": "oct",
      "use": "sig",
      "alg": "HS256",
      "k": "${SECRET_B64}"
    }
  ]
}
EOF

# Substituir o secret hardcoded no krakend.json pelo secret real
# Usa sed para substituir CHANGE-ME-OR-USE-SYMMETRIC-JSON-FILE pelo secret real
if command -v sed >/dev/null 2>&1; then
  sed -i "s/CHANGE-ME-OR-USE-SYMMETRIC-JSON-FILE/${JWT_SECRET_VALUE}/g" /etc/krakend/krakend.json
else
  # Fallback para sistemas sem sed (usa perl se disponível)
  if command -v perl >/dev/null 2>&1; then
    perl -pi -e "s/CHANGE-ME-OR-USE-SYMMETRIC-JSON-FILE/${JWT_SECRET_VALUE}/g" /etc/krakend/krakend.json
  else
    echo "⚠️  WARNING: Cannot replace secret in krakend.json (sed/perl not available)" >&2
    echo "   The secret in krakend.json may need to be manually updated." >&2
  fi
fi

# Iniciar KrakenD
exec /usr/bin/krakend run -c /etc/krakend/krakend.json -d

