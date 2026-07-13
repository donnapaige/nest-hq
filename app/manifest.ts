import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nest HQ',
    short_name: 'Nest HQ',
    description: "Your family's homebase",
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F6F3EC',
    theme_color: '#334266',
    icons: [
      { src: '/icons/72.png',  sizes: '72x72',   type: 'image/png' },
      { src: '/icons/96.png',  sizes: '96x96',   type: 'image/png' },
      { src: '/icons/128.png', sizes: '128x128', type: 'image/png' },
      { src: '/icons/144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/384.png', sizes: '384x384', type: 'image/png' },
      { src: '/icons/512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
