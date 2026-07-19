'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FiTarget, FiHeart, FiUsers, FiAward, FiArrowRight,
    FiCheckCircle, FiActivity, FiSearch, FiSmartphone,
    FiClipboard, FiMapPin, FiShield
} from 'react-icons/fi'
import ShopNavbar from '@/components/shop/ShopNavbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

const Stats = [
    { label: 'Utilisateurs Actifs', value: '10K+' },
    { label: 'Articles Santé', value: '500+' },
    { label: 'Diagnostic Précoce', value: '24/7' },
    { label: 'Experts Médicaux', value: '50+' },
]

const EcosystemFeatures = [
    {
        icon: <FiSearch className="w-7 h-7" />,
        title: "Diagnostic Précoce",
        description: "Mise en place d'outils d'auto-évaluation et de dépistage pour réduire l'errance médicale et identifier la maladie plus tôt."
    },
    {
        icon: <FiActivity className="w-7 h-7" />,
        title: "Sensibilisation",
        description: "Éduquer les patients et les praticiens pour réduire les complications liées à un mauvais suivi nutritionnel."
    },
    {
        icon: <FiShield className="w-7 h-7" />,
        title: "Bien-être Durable",
        description: "Promotion d'une santé optimisée sur le long terme en limitant les risques associés à la maladie cœliaque."
    },
    {
        icon: <FiSmartphone className="w-7 h-7" />,
        title: "Soins Coordonnés",
        description: "Plateforme numérique centralisée pour coordonner les soins et faciliter l'accès, même dans les zones rurales."
    },
    {
        icon: <FiAward className="w-7 h-7" />,
        title: "Accessibilité",
        description: "Action pour réduire les barrières financières via des politiques facilitant l'accès aux tests et produits adaptés."
    },
    {
        icon: <FiClipboard className="w-7 h-7" />,
        title: "Dossier Médical",
        description: "Gestion de dossiers électroniques sécurisés pour les patients et outils cliniques avancés pour les professionnels."
    }
]

export default function AboutPage() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-white">
            <ShopNavbar scrolled={scrolled} onCartOpen={() => { }} />

            <main>
                {/* Hero Section */}
                <section className="pt-32 pb-20 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-8"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-full font-bold text-sm uppercase tracking-wider">
                                    <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
                                    Plus qu'un simple E-commerce
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1]">
                                    Votre <span className="text-primary-600">Santé</span>, Notre Écosystème
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed font-medium max-w-xl">
                                    Glunovita redéfinit l'accompagnement de la maladie cœliaque en centralisant soins, informations et nutrition au sein d'une seule plateforme innovante.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <Link href="/shop">
                                        <button className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center gap-2 group">
                                            Explorer la Boutique <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                    <Link href="/register">
                                        <button className="px-8 py-4 bg-gray-50 text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                                            Créer mon Dossier Patient
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="relative"
                            >
                                <div className="absolute -inset-4 bg-primary-100 rounded-[3rem] -rotate-3 blur-2xl opacity-30"></div>
                                <div className="relative rounded-[3rem] overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-square bg-gray-100">
                                    <img
                                        src="/about_hero.png"
                                        alt="Glunovita Ecosystem"
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                                    />
                                </div>
                                <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl hidden md:block border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                                            <FiActivity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 leading-none">Bio-Suivi</p>
                                            <p className="text-sm text-gray-500 mt-1">Données centralisées</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Ecosystem Section */}
                <section className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h2 className="text-primary-600 font-black tracking-widest uppercase text-sm">Engagement Médical</h2>
                            <p className="text-4xl md:text-5xl font-black text-gray-900">Un écosystème de santé complet</p>
                            <p className="text-gray-500 font-medium text-lg mt-4">Nous brisons les barrières pour offrir un suivi médical sans compromis.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {EcosystemFeatures.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 group"
                                >
                                    <div className="w-14 h-14 bg-gray-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-500">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-4">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed font-medium">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team & Expertise Section */}
                <section className="py-32 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1 }}
                                className="relative rounded-[3rem] overflow-hidden shadow-2xl aspect-video lg:aspect-[4/5] bg-gray-100"
                            >
                                <img
                                    src="/team_about.png"
                                    alt="Glunovita Professional Team"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute bottom-10 left-10 text-white">
                                    <p className="text-2xl font-black">L'Expertise au cœur de l'action</p>
                                    <p className="text-primary-400 font-bold">Coordination des soins & Diagnostic</p>
                                </div>
                            </motion.div>

                            <div className="space-y-10">
                                <div className="space-y-6">
                                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                                        Réduire <span className="text-primary-600">les barrières</span> géographiques et financières
                                    </h2>
                                    <p className="text-lg text-gray-600 leading-relaxed font-medium">
                                        Glunovita facilite l'accès aux services de santé essentiels, notamment dans les zones rurales, tout en luttant pour des politiques nationales favorisant l'accès aux tests et produits adaptés.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        "Outils cliniques pour les professionnels",
                                        "Coordination médicale simplifiée",
                                        "Accès facilité en zones isolées",
                                        "Réduction active des complications"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                                            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <FiCheckCircle className="w-4 h-4" />
                                            </div>
                                            <span className="text-gray-900 font-bold text-lg">{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link href="/contact" className="inline-block">
                                    <button className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black shadow-2xl hover:bg-gray-800 transition-all flex items-center gap-3">
                                        Devenir Partenaire Santé <FiArrowRight />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Digital Platform Highlight */}
                <section className="py-24 bg-primary-900 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-800 -skew-x-12 translate-x-32 hidden lg:block"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="text-white space-y-8">
                                <h2 className="text-4xl md:text-5xl font-black leading-tight">
                                    Une plateforme unique pour <span className="text-primary-400">patient & médecin</span>
                                </h2>
                                <p className="text-xl text-primary-100 font-medium">
                                    Nous centralisons les informations pour permettre aux patients de mieux comprendre leur état et aux médecins de suivre l'évolution clinique avec précision.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md">
                                        <p className="text-primary-400 font-black text-lg mb-2">Côté Patient</p>
                                        <p className="text-sm text-gray-300">Dossier électronique, outils d'auto-évaluation et boutique nutritionnelle.</p>
                                    </div>
                                    <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md">
                                        <p className="text-primary-400 font-black text-lg mb-2">Côté Praticien</p>
                                        <p className="text-sm text-gray-300">Outils de gestion clinique, coordination des soins et base de données experte.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="bg-white p-1 rounded-[3rem] shadow-2xl overflow-hidden">
                                    <div className="aspect-video bg-gray-100 rounded-[2.8rem] flex items-center justify-center">
                                        {/* You can put a dashboard preview image here later */}
                                        <FiActivity className="w-20 h-20 text-primary-600 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
