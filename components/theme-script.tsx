"use client"

import { useServerInsertedHTML } from "next/navigation"

export function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        id="theme-init"
        dangerouslySetInnerHTML={{
          __html: `
            try {
              let theme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1] || 'system';
              if (theme === 'system') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          `,
        }}
      />
    )
  })

  return null
}
