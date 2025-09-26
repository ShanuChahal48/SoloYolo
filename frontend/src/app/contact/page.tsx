import { getContactPage } from '@/lib/api';
import ContactForm from '@/components/ContactForm';
import { Mail, Phone, MapPin } from 'lucide-react';

export default async function ContactPage() {
    const data = await getContactPage();
    const attributes = data?.attributes;

    if (!attributes) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Could not load contact information. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            {/* Hero Section */}
            <section className="bg-teal-700 text-white py-20 text-center">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{attributes.headline || 'Contact Us'}</h1>
                    <p className="mt-2 text-lg text-teal-100 max-w-2xl mx-auto">{attributes.subheading || 'Have questions or want to plan your next adventure? Reach out to us!'}</p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Contact Info Section */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-gray-800">Contact Information</h2>
                            <p className="text-gray-600">
                                Fill up the form and our team will get back to you within 24 hours. You can also reach us through the contact details below.
                            </p>
                            
                            <div className="flex items-start space-x-4">
                                <Mail className="text-teal-600 mt-1 h-6 w-6" />
                                <div>
                                    <h3 className="font-semibold text-gray-800">Email</h3>
                                    <a href={`mailto:${attributes.email}`} className="text-gray-600 hover:text-teal-600">{attributes.email}</a>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <Phone className="text-teal-600 mt-1 h-6 w-6" />
                                <div>
                                    <h3 className="font-semibold text-gray-800">Phone</h3>
                                    <a href={`tel:${attributes.phone}`} className="text-gray-600 hover:text-teal-600">{attributes.phone}</a>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-4">
                                <MapPin className="text-teal-600 mt-1 h-6 w-6" />
                                <div>
                                    <h3 className="font-semibold text-gray-800">Office Address</h3>
                                    <p className="text-gray-600 whitespace-pre-line">{attributes.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Section */}
                        <div>
                           <ContactForm />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}