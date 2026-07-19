'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const footerSections = [
        {
            title: 'Navigation',
            links: [
                { label: 'Accueil', href: '/' },
                { label: 'Boutique', href: '/dashboard/shop' },
                { label: 'À propos', href: '#' },
                { label: 'Déclarations', href: '#' },
            ],
        },
        {
            title: 'Support',
            links: [
                { label: 'Centre d\'aide', href: '#' },
                { label: 'Contact', href: '#' },
                { label: 'FAQ', href: '#' },
                { label: 'Sécurité Santé', href: '#' },
            ],
        },
        {
            title: 'Légal',
            links: [
                { label: 'Confidentialité', href: '#' },
                { label: 'Conditions d\'utilisation', href: '#' },
                { label: 'Mentions légales', href: '#' },
                { label: 'Cookies', href: '#' },
            ],
        },
    ]

    return (
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
                                <img
                                    src="/logo.jpg"
                                    alt="GLUNOVITA Logo"
                                    className="w-10 h-10 object-contain rounded-lg"
                                />
                            </div>
                            <span className="text-2xl font-bold gradient-text">
                                GLUNOVITA
                            </span>
                        </Link>
                        <p className="text-gray-600 mb-8 max-w-sm">
                            Votre partenaire de confiance pour une vie sans gluten simplifiée.
                            Gestion de santé, conseils nutritionnels et boutique spécialisée.
                        </p>
                        <div className="flex space-x-4">
                            {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, idx) => (
                                <motion.a
                                    key={idx}
                                    href="#"
                                    whileHover={{ y: -3 }}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-all"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">
                                {section.title}
                            </h3>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-600 hover:text-primary-600 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact Section */}
                    <div className="lg:col-span-1">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">
                            Contact
                        </h3>
                        <ul className="space-y-4 text-gray-600">
                            <li className="flex items-start space-x-3">
                                <FiMapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                                <span>Residence Fatma Boutique 7 , Avenue des Martyrs, Mourouj</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FiPhone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                <span>+216 99 741 608</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FiMail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                <span>amira.mannai.tec@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-500">
                    <p>© {currentYear} GLUNOVITA. Tous droits réservés.</p>
                    <div className="flex items-center space-x-4">
                        <span className="hidden lg:inline text-xs font-medium uppercase tracking-wider">Abonnez-vous à la newsletter</span>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 w-48 text-xs transition-all"
                            />
                            <button className="px-5 py-2 bg-primary-600 text-white rounded-r-xl hover:bg-primary-700 transition-colors text-xs font-bold shadow-lg shadow-primary-600/20 active:scale-95">
                                S'inscrire
                            </button>
                        </div>
                    </div>
                    <div className="flex space-x-6">
                        <span className="font-medium text-gray-400">Fait avec Passion pour votre Santé</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
