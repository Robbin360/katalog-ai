# Investigación Detallada de Vulnerabilidades - Katalog AI

**Fecha:** 20 de Marzo, 2026  
**Investigación basada en evidencia real del código

---

## 1. Análisis SSRF en API Shopify

### Evidencia Encontrada

**Archivo:** `app/api/shopify/sync/route.ts:31`
```typescript
const shopifyUrl = `https://${integration.shop_url}/admin/api/2024-01/products.json?limit=50`
```

**Contexto:**
- `integration.shop_url` viene de la base de datos (línea 19-24)
- Se obtiene de la tabla `integrations` con `user_id` y `provider='shopify'`
- No hay validación del valor de `shop_url` antes de usarlo

**Fuente de datos (account/page.tsx:140-145):**
```typescript
const cleanUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
const { error } = await supabase.from('integrations').upsert({
    user_id: userId,
    provider: 'shopify',
    shop_url: cleanUrl,  // <-- Se guarda directamente el input del usuario
    access_token: shopToken
})
```

**Análisis de Riesgo:**
- El usuario puede ingresar cualquier valor en `shopUrl`
- Solo se remueve `https://` y `/` final
- No se valida que sea un dominio Shopify válido
- El fetch se hace directamente a la URL construida

**Conclusión:** **Riesgo SSRF confirmado** - El usuario puede hacer que el servidor haga requests a cualquier dominio.

---

## 2. Análisis XSS en dangerouslySetInnerHTML

### Evidencia Encontrada

**Archivo:** `app/(app)/dashboard/page.tsx:506`
```typescript
<div dangerouslySetInnerHTML={{ __html: product.fullData.description_html || "<p>No data.</p>" }} />
```

**Contexto:**
- `fullData` viene de `p.ai_output || {}` (línea 284)
- `ai_output` es datos generados por IA o procesados
- `description_html` no tiene sanitización

**Fuente de datos:**
```typescript
const products: Product[] = dashboardData?.products?.map((p: any) => {
    const ai = p.ai_output || {}  // <-- Datos de la base de datos
    // ...
    fullData: ai,  // <-- Se asigna directamente
})
```

**Análisis de Riesgo:**
- `ai_output` viene de la base de datos, posiblemente de procesamiento de IA
- Si la IA genera o procesa HTML malicioso, se ejecuta en el cliente
- No hay sanitización con DOMPurify o similar

**Conclusión:** **Riesgo XSS confirmado** - HTML externo se renderiza sin sanitización.

---

## 3. Análisis de Validación de Entrada

### shop_url Validation
**Account page (input del usuario):**
```typescript
const cleanUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
```
- Solo remueve protocolo y slash final
- Sin validación de formato Shopify
- Sin whitelist de dominios permitidos

### API Usage
**API route (consumo del dato):**
```typescript
const shopifyUrl = `https://${integration.shop_url}/admin/api/2024-01/products.json?limit=50`
```
- Usa directamente el valor de la base de datos
- Sin validación antes del fetch
- Sin sanitización de URL

---

## 4. Verificación de Dependencias

### Resultado npm audit --json
```json
{
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 0,
      "moderate": 2,
      "high": 2,
      "critical": 0,
      "total": 4
    }
  }
}
```

**Vulnerabilidades confirmadas:**
1. **Flatted <= 3.4.1** - CWE-674, CWE-1321 (Prototype Pollution)
2. **Minimatch <= 3.1.3** - CWE-1333, CWE-407 (ReDoS)
3. **Next.js 16.1.6** - Múltiples CWEs (CSRF bypass, DoS, HTTP smuggling)
4. **AJV < 6.14.0** - CWE-674 (ReDoS)

---

## 5. Configuración de Seguridad

### next.config.ts
```typescript
const nextConfig: NextConfig = {
  /* config options here */
};
```
**Evidencia:** Configuración vacía, sin headers de seguridad.

### Headers Faltantes
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

---

## 6. Conclusiones Basadas en Evidencia

### Vulnerabilidades Confirmadas:
1. **SSRF** - Evidencia clara en API Shopify sin validación de URL
2. **XSS** - Evidencia clara en dangerouslySetInnerHTML sin sanitización
3. **Security Misconfiguration** - next.config.ts vacío confirmado
4. **Vulnerable Dependencies** - npm audit confirma 4 vulnerabilidades

### No se encontraron:
- Secrets hardcodeados (confirmado por búsqueda)
- SQL injection patterns (confirmado por búsqueda)
- Command execution patterns (confirmado por búsqueda)

---

## 7. Recomendaciones Basadas en Evidencia

### Inmediato (Basado en código real):
1. **Validar shop_url** antes de guardar en base de datos
2. **Sanitizar description_html** con DOMPurify
3. **Configurar headers** en next.config.ts
4. **Actualizar dependencias** con npm audit fix

### Código específico para fixes:
```typescript
// 1. Validación shop_url
const shopUrlPattern = /^[a-zA-Z0-9][-a-zA-Z0-9]*\.myshopify\.com$/;
if (!shopUrlPattern.test(cleanUrl)) {
    throw new Error("Invalid Shopify URL format");
}

// 2. Sanitización HTML
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(product.fullData.description_html || "<p>No data.</p>") 
}} />
```

---

*Investigación completada basada 100% en evidencia del código fuente*
