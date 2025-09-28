export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  // 💡 CRITICAL FIX: Use object syntax to configure 'strapi::session'
  {
    name: 'strapi::session',
    config: {
      key: 'strapi.sid',
      // This setting tells Koa to trust the X-Forwarded-Proto header from Render
      proxy: true, 
      maxAge: 86400000,
      autoCommit: true,
      // You may need to uncomment and set secure: true if you still have issues, 
      // but proxy: true usually handles it.
      // secure: true, 
    },
  },
  'strapi::favicon',
  'strapi::public',
];