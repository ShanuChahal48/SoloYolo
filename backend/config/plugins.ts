export default ({ env }) => ({
		upload: (() => {
			const config = {
				provider: 'cloudinary',
				providerOptions: {
					cloud_name: env('CLOUDINARY_NAME'),
					api_key: env('CLOUDINARY_KEY'),
					api_secret: env('CLOUDINARY_SECRET')
				},
				actionOptions: {
					upload: {},
					delete: {},
				},
			};
			console.log('[Strapi] Cloudinary upload provider config loaded:', config.providerOptions);
			return config;
		})(),
});
