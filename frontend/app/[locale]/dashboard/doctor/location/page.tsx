'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Map from '@/components/ui/Map';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { FiMapPin } from 'react-icons/fi';

export default function DoctorLocationPage() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (user) {
            if (user.location && user.location.lat && user.location.lng) {
                setLocation(user.location);
            }
            if (user.address) {
                setAddress(user.address);
            }
        }
    }, [user]);

    const handleLocationSelect = async (lat: number, lng: number) => {
        setLocation({ lat, lng });

        // Reverse geocoding using Nominatim
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data.display_name) {
                setAddress(data.display_name);
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    };

    const handleSave = async () => {
        if (!location) {
            toast.error('Veuillez sélectionner une position sur la carte');
            return;
        }

        setLoading(true);
        try {
            const response = await api.put(`/users/${user?._id}`, {
                location,
                address
            });

            if (response.data.success) {
                toast.success('Localisation mise à jour avec succès');
                if (refreshUser) await refreshUser();
            }
        } catch (error) {
            console.error('Error updating location:', error);
            toast.error('Erreur lors de la mise à jour de la localisation');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else if (user && user.role !== 'DOCTOR') {
            router.push(`/dashboard/${user.role.toLowerCase()}`);
        }
    }, [user, router]);

    return (
        <Layout>
            <div className="px-4 py-6 sm:px-0">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                            <FiMapPin className="w-8 h-8 mr-3 text-teal-600" />
                            Ma Localisation
                        </h1>
                        <p className="text-gray-600">
                            Définissez l'emplacement de votre cabinet pour permettre aux patients de vous trouver sur la carte.
                        </p>
                    </motion.div>

                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                        <div className="space-y-6">
                            <Input
                                label="Adresse du cabinet"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Sélectionnez un point sur la carte pour remplir automatiquement"
                            />

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Position sur la carte</label>
                                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                                    <Map
                                        height="500px"
                                        onLocationSelect={handleLocationSelect}
                                        selectedLocation={location}
                                        center={location ? [location.lat, location.lng] : [36.8065, 10.1815]}
                                        zoom={13}
                                    />
                                </div>
                                <p className="text-sm text-gray-500">
                                    Cliquez sur la carte pour placer votre repère.
                                </p>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleSave}
                                    isLoading={loading}
                                    disabled={!location}
                                    size="lg"
                                >
                                    Enregistrer mes coordonnées
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
