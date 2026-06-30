This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Mapa de rutas de traducción — /pricing (i18n)

Hay tres árboles de claves distintos en `lib/locales/{en,es}.json`
relacionados a `/pricing`. Antes de tocar cualquier clave de pricing,
confirmar a cuál de los tres pertenece:

1. **`landing.pricing.plans.*`** — las tarjetas de plan **ACTIVAS** que renderiza
   `app/pricing/page.tsx` (`free`→`starter`, `pro`, `business`→`enterprise`,
   `proMax`). Es la única ruta que el código realmente lee en la página /pricing.

2. **`pricing.plans.*`** — árbol **LEGACY**. Confirmado sin uso en el código
   (búsqueda exhaustiva de `t()` y grep, ver historial de este repo). No
   eliminar sin una decisión explícita aparte.

3. **`pricing.enterprise`** — sección standalone de Enterprise al pie de la
   página (6 feature cards, "Talk to sales →", $499/mes). No tiene relación
   con el plan Business ni con la clave `enterprise` del punto 1 — coinciden
   de nombre por casualidad, no de contenido.

> ⚠️ **TRAMPA CONOCIDA**: la clave `enterprise` existe en DOS lugares con
> contenido completamente distinto:
> - `landing.pricing.plans.enterprise` = el plan Business ($149/mes)
> - `pricing.enterprise` = la sección Enterprise real ($499+/mes)
>
> Verificar siempre **cuál** ruta estás tocando antes de editar "enterprise".
