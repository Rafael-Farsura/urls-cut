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
# Usa sed para substituir o placeholder pelo secret real
# Escapa caracteres especiais no secret para uso em sed
SECRET_ESCAPED=$(echo "${JWT_SECRET_VALUE}" | sed 's/[[\.*^$()+?{|]/\\&/g')

echo "🔧 Replacing JWT secret in krakend.json..." >&2

if command -v sed >/dev/null 2>&1; then
  # Substitui todas as ocorrências do secret placeholder
  # Usa uma cópia temporária para garantir que funcione mesmo com volumes montados
  # Primeiro, tenta modificar diretamente (pode funcionar se o volume permitir)
  if sed -i "s/your-super-secret-jwt-key-change-in-production/${SECRET_ESCAPED}/g" /etc/krakend/krakend.json 2>/dev/null; then
    # Verifica se a substituição funcionou
    if grep -q "${JWT_SECRET_VALUE}" /etc/krakend/krakend.json; then
      echo "✅ JWT secret replaced successfully (direct modification)" >&2
    else
      echo "⚠️  WARNING: JWT secret replacement may have failed" >&2
    fi
  else
    # Se falhar, tenta via arquivo temporário
    cp /etc/krakend/krakend.json /tmp/krakend.json.tmp
    sed "s/your-super-secret-jwt-key-change-in-production/${SECRET_ESCAPED}/g" /tmp/krakend.json.tmp > /tmp/krakend.json.new
    if [ -f /tmp/krakend.json.new ]; then
      cat /tmp/krakend.json.new > /etc/krakend/krakend.json
      rm -f /tmp/krakend.json.tmp /tmp/krakend.json.new
      if grep -q "${JWT_SECRET_VALUE}" /etc/krakend/krakend.json; then
        echo "✅ JWT secret replaced successfully (via temp file)" >&2
      else
        echo "⚠️  WARNING: JWT secret replacement may have failed" >&2
      fi
    else
      echo "❌ ERROR: Failed to replace JWT secret" >&2
      exit 1
    fi
  fi
else
  # Fallback para sistemas sem sed (usa perl se disponível)
  if command -v perl >/dev/null 2>&1; then
    cp /etc/krakend/krakend.json /tmp/krakend.json.tmp
    perl -pi -e "s/your-super-secret-jwt-key-change-in-production/\Q${JWT_SECRET_VALUE}\E/g" /tmp/krakend.json.tmp
    mv /tmp/krakend.json.tmp /etc/krakend/krakend.json
    echo "✅ JWT secret replaced successfully (using perl)" >&2
  else
    echo "❌ ERROR: Cannot replace secret in krakend.json (sed/perl not available)" >&2
    echo "   The secret in krakend.json may need to be manually updated." >&2
    exit 1
  fi
fi

# Iniciar KrakenD
exec /usr/bin/krakend run -c /etc/krakend/krakend.json -d

