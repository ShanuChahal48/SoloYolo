import { getContactPage } from '@/lib/api';
import { getMediaUrl } from '@/lib/media';
import ContactForm from '@/components/ContactForm';
import { Mail, Phone, MapPin } from 'lucide-react';

export default async function ContactPage() {
    const attributes = await getContactPage();

    if (!attributes) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Could not load contact information. Please try again later.</p>
            </div>
        );
    }

            return (
                    <main
                            className="min-h-screen"
                            style={{
                                backgroundColor: '#0f172a',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'repeat',
                                backgroundSize: '100px 100px',
                                backgroundAttachment: 'fixed',
                                backgroundPosition: 'center'
                            }}
                    >
            {/* Hero Section with Animation */}
                        <section className="relative text-white overflow-hidden">
                            {(() => {
                                const media = attributes.hero_media?.data || attributes.hero_media;
                                const url = getMediaUrl(media);
                                if (!url) return null; // rely on page background for consistency
                                const isVideo = url.match(/\.(mp4|webm|mov)$/i);
                                return isVideo ? (
                                    <video key={url} src={url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <img key={url} src={url} alt={attributes.headline || 'Contact background'} className="absolute inset-0 w-full h-full object-cover" />
                                );
                            })()}
                            <div className="relative z-10 container mx-auto px-6">
                                <div className="min-h-[55vh] md:min-h-[60vh] flex flex-col justify-center items-center text-center pt-28 md:pt-32 pb-16">
                                  <div className="animate-fade-in-up max-w-5xl">
                                      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">{attributes.headline || 'Contact Us'}</h1>
                                      <p className="text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">
                                          {attributes.subheading || 'Have questions or want to plan your next adventure? Reach out to us!'}
                                      </p>
                                  </div>
                                </div>
                            </div>
                        </section>

            {/* Main Content */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Contact Info Section */}
                        <div className="space-y-8 animate-fade-in-up">
                            <h2 className="text-4xl font-bold text-white">Get in Touch</h2>
                            <p className="text-lg text-gray-300 leading-relaxed">
                                Fill up the form and our team will get back to you within 24 hours. You can also reach us through the contact details below.
                            </p>
                            
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4 p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg hover-lift transition-all duration-300">
                                    <div className="p-3 bg-teal-500/20 rounded-full">
                                        <Mail className="text-teal-400 h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-lg">Email</h3>
                                        <a href={`mailto:${attributes.email}`} className="text-gray-300 hover:text-teal-400 transition-colors duration-300">{attributes.email}</a>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg hover-lift transition-all duration-300">
                                    <div className="p-3 bg-teal-500/20 rounded-full">
                                        <Phone className="text-teal-400 h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-lg">Phone</h3>
                                        <a href={`tel:${attributes.phone}`} className="text-gray-300 hover:text-teal-400 transition-colors duration-300">{attributes.phone}</a>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4 p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg hover-lift transition-all duration-300">
                                    <div className="p-3 bg-teal-500/20 rounded-full">
                                        <MapPin className="text-teal-400 h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-lg">Office Address</h3>
                                        <p className="text-gray-300 whitespace-pre-line leading-relaxed">{attributes.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Section */}
                        <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                           <ContactForm />
                        </div>
                    </div>
                </div>
            </section>
    </main>
    );
}