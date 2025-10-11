export default ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        // Ensure Cloudinary stores and delivers PDFs as public upload resources.
        upload: {
          resource_type: 'auto',
          type: 'upload',
          access_mode: 'public',
        },
        delete: {},
      },
    },
  },
});
