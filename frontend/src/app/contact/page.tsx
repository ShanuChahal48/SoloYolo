import { getContactPage } from '@/lib/api';
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
      backgroundPosition: 'center',
    }}
  >
            {/* Hero Section with Animation */}
                                    <section
                                        className="relative text-white py-24 text-center overflow-hidden"
                                        style={{
                                            backgroundColor: '#0f172a',
                                            backgroundImage: `linear-gradient(120deg, rgba(34,211,238,0.18) 0%, rgba(59,130,246,0.18) 100%), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3C!-- Stars (White/Slate-100 with varying opacity) --%3E%3Ccircle cx='10' cy='10' r='1' fill='%23f1f5f9' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='0.5' fill='%23f1f5f9' opacity='0.4'/%3E%3Ccircle cx='80' cy='20' r='1.5' fill='%23f1f5f9' opacity='0.15'/%3E%3Ccircle cx='30' cy='75' r='0.8' fill='%23f1f5f9' opacity='0.3'/%3E%3Ccircle cx='95' cy='90' r='0.6' fill='%23f1f5f9' opacity='0.5'/%3E%3Ccircle cx='5' cy='55' r='1.2' fill='%23f1f5f9' opacity='0.1'/%3E%3C!-- Subtle Nebula/Swirl (Cyan with very low opacity) --%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.08' d='M0 50 C25 25, 75 75, 100 50'/%3E%3Cpath fill='none' stroke='%2338bdf8' stroke-width='0.3' opacity='0.05' d='M50 0 C75 25, 25 75, 50 100'/%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'repeat',
                                            backgroundSize: '100px 100px',
                                            backgroundAttachment: 'fixed',
                                            backgroundPosition: 'center',
                                        }}
                                    >
                                        {/* Floating Elements for blueish effect */}
                                        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float z-10"></div>
                                        <div className="absolute top-40 right-20 w-16 h-16 bg-cyan-400/20 rounded-full animate-float z-10" style={{animationDelay: '1s'}}></div>
                                        <div className="absolute bottom-40 left-20 w-12 h-12 bg-blue-400/20 rounded-full animate-float z-10" style={{animationDelay: '2s'}}></div>
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-float"></div>
                    <div className="absolute top-40 right-20 w-24 h-24 bg-amber-400/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-20 left-20 w-16 h-16 bg-teal-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
                </div>
                
                <div className="relative z-10 container mx-auto px-6">
                    <div className="animate-fade-in-up">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">{attributes.headline || 'Contact Us'}</h1>
                        <p className="text-xl text-teal-100 max-w-3xl mx-auto leading-relaxed">
                            {attributes.subheading || 'Have questions or want to plan your next adventure? Reach out to us!'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Contact Info Section */}
                        <div className="space-y-8 animate-fade-in-up">
                            <h2 className="text-4xl font-bold text-gray-800">Get in Touch</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Fill up the form and our team will get back to you within 24 hours. You can also reach us through the contact details below.
                            </p>
                            
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg hover-lift transition-all duration-300">
                                    <div className="p-3 bg-teal-100 rounded-full">
                                        <Mail className="text-teal-600 h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-lg">Email</h3>
                                        <a href={`mailto:${attributes.email}`} className="text-gray-600 hover:text-teal-600 transition-colors duration-300">{attributes.email}</a>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg hover-lift transition-all duration-300">
                                    <div className="p-3 bg-teal-100 rounded-full">
                                        <Phone className="text-teal-600 h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-lg">Phone</h3>
                                        <a href={`tel:${attributes.phone}`} className="text-gray-600 hover:text-teal-600 transition-colors duration-300">{attributes.phone}</a>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4 p-6 bg-white rounded-xl shadow-lg hover-lift transition-all duration-300">
                                    <div className="p-3 bg-teal-100 rounded-full">
                                        <MapPin className="text-teal-600 h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-lg">Office Address</h3>
                                        <p className="text-gray-600 whitespace-pre-line leading-relaxed">{attributes.address}</p>
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