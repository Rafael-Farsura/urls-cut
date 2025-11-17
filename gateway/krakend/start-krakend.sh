#!/bin/sh
# Script para gerar symmetric.json com o JWT_SECRET antes de iniciar KrakenD

JWT_SECRET_VALUE="${JWT_SECRET:-your-super-secret-jwt-key-change-in-production}"

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

# Iniciar KrakenD
exec /usr/bin/krakend run -c /etc/krakend/krakend.json -d

