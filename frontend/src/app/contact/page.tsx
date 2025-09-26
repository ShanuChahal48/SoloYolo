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
        <div className="bg-gradient-to-br from-gray-50 to-teal-50 min-h-screen">
            {/* Hero Section with Animation */}
            <section className="relative bg-gradient-to-br from-teal-800 via-teal-600 to-amber-500 text-white py-24 text-center overflow-hidden">
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
        </div>
    );
}