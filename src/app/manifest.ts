import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return { id: '/recipient', name: 'SporManage Bildirimlerim', short_name: 'SporManage', start_url: '/recipient', scope: '/', display: 'standalone', lang: 'tr', background_color: '#ffffff', theme_color: '#ea580c', icons: [{ src: '/push-icon.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: '/push-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }] }
}
