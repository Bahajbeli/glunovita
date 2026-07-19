'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Map from '@/components/ui/Map';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiClock, FiMapPin, FiUser, FiCalendar, FiDollarSign, FiGlobe, FiCheck } from 'react-icons/fi';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';

interface Doctor {
    _id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
    address?: string;
    location?: {
        lat: number;
        lng: number;
    };
    region?: string;
    profileQuestions?: {
        bio?: string;
        yearsOfExperience?: number;
        languages?: string[];
        consultationFee?: number;
        workingHours?: {
            start: string;
            end: string;
        };
        consultationDuration?: number;
        acceptsNewPatients?: boolean;
    };
}

export default function BookConsultationPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [bookingData, setBookingData] = useState({
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            fetchAvailableSlots();
        } else {
            setAvailableSlots([]);
            setSelectedSlot('');
        }
    }, [selectedDoctor, selectedDate]);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/users/doctors');
            setDoctors(res.data.data);
        } catch (err) {
            console.error('Error fetching doctors:', err);
            toast.error('Impossible de charger la liste des médecins');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async () => {
        if (!selectedDoctor || !selectedDate) return;

        setLoadingSlots(true);
        try {
            const res = await api.get(`/appointments/available-slots?doctorId=${selectedDoctor._id}&date=${selectedDate}&duration=30`);
            setAvailableSlots(res.data.data);
            setSelectedSlot('');
        } catch (err: any) {
            console.error('Error fetching slots:', err);
            toast.error(err.response?.data?.message || 'Impossible de charger les créneaux disponibles');
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleOpenBooking = (doctor: Doctor) => {
        // Close any open map popups by removing focus from map
        setTimeout(() => {
            setSelectedDoctor(doctor);
            setIsModalOpen(true);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setSelectedDate(tomorrow.toISOString().split('T')[0]);
            setSelectedSlot('');
            setBookingData({ reason: '' });
        }, 100);
    };

    const handleBook = async () => {
        if (!selectedDoctor || !selectedDate || !selectedSlot) {
            toast.error('Veuillez sélectionner une date et un créneau');
            return;
        }

        setSubmitting(true);
        try {
            const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
            const [hours, minutes] = selectedSlot.split(':').map(Number);
            const endMinutes = (hours * 60 + minutes + 30) % (24 * 60);
            const endHours = Math.floor(endMinutes / 60);
            const endMins = endMinutes % 60;
            const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

            await api.post('/appointments', {
                doctorId: selectedDoctor._id,
                appointmentDate: formattedDate,
                startTime: selectedSlot,
                endTime: endTime,
                duration: 30,
                type: 'CONSULTATION',
                reason: bookingData.reason
            });

            toast.success('Consultation réservée avec succès !');
            setIsModalOpen(false);
            setSelectedDoctor(null);
            setSelectedDate('');
            setSelectedSlot('');
            setAvailableSlots([]);
            setBookingData({ reason: '' });
        } catch (err: any) {
            console.error('Error booking consultation:', err);
            toast.error(err.response?.data?.message || 'Erreur lors de la réservation');
        } finally {
            setSubmitting(false);
        }
    };

    const markers = useMemo(() => doctors
        .filter(doc => doc.location && doc.location.lat && doc.location.lng)
        .map(doc => ({
            id: doc._id,
            position: [doc.location!.lat, doc.location!.lng] as [number, number],
            title: `Dr. ${doc.firstName} ${doc.lastName}`,
            description: `${doc.specialization || 'Médecin généraliste'}${doc.address ? ` - ${doc.address}` : ''}`,
            actionLabel: 'Réserver',
            onAction: () => handleOpenBooking(doc)
        })), [doctors]);

    const mapCenter = useMemo(() => {
        const doctorsWithLocation = doctors.filter(doc => doc.location && doc.location.lat && doc.location.lng);
        if (doctorsWithLocation.length === 0) {
            return [36.8065, 10.1815] as [number, number];
        }
        const avgLat = doctorsWithLocation.reduce((sum, doc) => sum + doc.location!.lat, 0) / doctorsWithLocation.length;
        const avgLng = doctorsWithLocation.reduce((sum, doc) => sum + doc.location!.lng, 0) / doctorsWithLocation.length;
        return [avgLat, avgLng] as [number, number];
    }, [doctors]);

    const doctorsWithLocation = doctors.filter(doc => doc.location && doc.location.lat && doc.location.lng);

    return (
        <Layout>
            <div className="px-4 py-6 sm:px-0">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                    <FiCalendar className="w-8 h-8 mr-3 text-teal-600" />
                                    Réserver une Consultation
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Trouvez un médecin près de chez vous et réservez votre consultation en ligne
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-gray-500 bg-teal-50 px-4 py-2 rounded-full border border-teal-200">
                                    {doctors.length} médecin(s) disponible(s)
                                </div>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('map')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                            viewMode === 'map'
                                                ? 'bg-white text-teal-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <FiMapPin className="w-4 h-4 inline mr-2" />
                                        Carte
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                            viewMode === 'list'
                                                ? 'bg-white text-teal-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <FiUser className="w-4 h-4 inline mr-2" />
                                        Liste
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Map View */}
                    {viewMode === 'map' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <FiMapPin className="w-5 h-5 mr-2 text-teal-600" />
                                Carte des Médecins
                            </h2>
                            {loading ? (
                                <div className="h-[600px] bg-gray-50 animate-pulse rounded-xl flex items-center justify-center">
                                    <span className="text-gray-400">Chargement de la carte...</span>
                                </div>
                            ) : doctorsWithLocation.length === 0 ? (
                                <div className="h-[600px] bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <div className="text-center">
                                        <FiMapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg mb-2">Aucun médecin avec localisation disponible</p>
                                        <p className="text-gray-400 text-sm">Passez à la vue liste pour voir tous les médecins</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg relative" style={{ zIndex: 1 }}>
                                    <Map
                                        height="600px"
                                        markers={markers}
                                        center={mapCenter}
                                        zoom={7}
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <FiUser className="w-5 h-5 mr-2 text-teal-600" />
                                Liste des Médecins
                            </h2>
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                                    ))}
                                </div>
                            ) : doctors.length === 0 ? (
                                <div className="text-center py-12">
                                    <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Aucun médecin disponible</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {doctors.map((doctor) => (
                                        <motion.div
                                            key={doctor._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => handleOpenBooking(doctor)}
                                            className="p-5 border-2 border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-lg cursor-pointer transition-all bg-white group"
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className="w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                                                    {doctor.firstName[0]}{doctor.lastName[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-teal-600 transition-colors">
                                                        Dr. {doctor.firstName} {doctor.lastName}
                                                    </h3>
                                                    <p className="text-sm text-teal-600 font-medium mb-2">
                                                        {doctor.specialization || 'Médecin généraliste'}
                                                    </p>
                                                    
                                                    {doctor.profileQuestions?.yearsOfExperience && (
                                                        <div className="flex items-center text-xs text-gray-500 mb-1">
                                                            <FiClock className="w-3 h-3 mr-1" />
                                                            {doctor.profileQuestions.yearsOfExperience} ans d'expérience
                                                        </div>
                                                    )}
                                                    
                                                    {doctor.address && (
                                                        <div className="flex items-start text-xs text-gray-500 mb-2">
                                                            <FiMapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                                            <span className="line-clamp-2">{doctor.address}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {doctor.profileQuestions?.languages && doctor.profileQuestions.languages.length > 0 && (
                                                        <div className="flex items-center text-xs text-gray-500 mb-2">
                                                            <FiGlobe className="w-3 h-3 mr-1" />
                                                            {doctor.profileQuestions.languages.slice(0, 2).join(', ')}
                                                            {doctor.profileQuestions.languages.length > 2 && '...'}
                                                        </div>
                                                    )}
                                                    
                                                    {doctor.profileQuestions?.consultationFee && (
                                                        <div className="flex items-center text-sm font-semibold text-teal-600">
                                                            <FiDollarSign className="w-4 h-4 mr-1" />
                                                            {doctor.profileQuestions.consultationFee} TND
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <Button
                                                    fullWidth
                                                    className="group-hover:bg-teal-600 group-hover:text-white"
                                                >
                                                    Réserver une consultation
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Booking Modal */}
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedDate('');
                            setSelectedSlot('');
                            setAvailableSlots([]);
                        }}
                        title="Réserver une Consultation"
                        size="lg"
                    >
                        {selectedDoctor && (
                            <div className="space-y-6">
                                {/* Doctor Info Card */}
                                <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-5 rounded-xl border border-teal-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                            {selectedDoctor.firstName[0]}{selectedDoctor.lastName[0]}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-xl mb-1">
                                                Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                                            </h3>
                                            <p className="text-sm text-teal-700 font-medium mb-2">
                                                {selectedDoctor.specialization || 'Médecin généraliste'}
                                            </p>
                                            <div className="space-y-1">
                                                {selectedDoctor.address && (
                                                    <p className="text-xs text-gray-600 flex items-center">
                                                        <FiMapPin className="w-3 h-3 mr-2" />
                                                        {selectedDoctor.address}
                                                    </p>
                                                )}
                                                {selectedDoctor.profileQuestions?.yearsOfExperience && (
                                                    <p className="text-xs text-gray-600 flex items-center">
                                                        <FiClock className="w-3 h-3 mr-2" />
                                                        {selectedDoctor.profileQuestions.yearsOfExperience} ans d'expérience
                                                    </p>
                                                )}
                                                {selectedDoctor.profileQuestions?.languages && selectedDoctor.profileQuestions.languages.length > 0 && (
                                                    <p className="text-xs text-gray-600 flex items-center">
                                                        <FiGlobe className="w-3 h-3 mr-2" />
                                                        {selectedDoctor.profileQuestions.languages.join(', ')}
                                                    </p>
                                                )}
                                                {selectedDoctor.profileQuestions?.consultationFee && (
                                                    <p className="text-sm font-semibold text-teal-700 flex items-center mt-2">
                                                        <FiDollarSign className="w-4 h-4 mr-1" />
                                                        Tarif: {selectedDoctor.profileQuestions.consultationFee} TND
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                                        <FiCalendar className="w-4 h-4 mr-2 text-teal-600" />
                                        Date de la consultation <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="hover:border-teal-400 focus:border-teal-500"
                                    />
                                </div>

                                {/* Time Slots */}
                                {selectedDate && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                                            <FiClock className="w-4 h-4 mr-2 text-teal-600" />
                                            Créneaux disponibles <span className="text-red-500">*</span>
                                        </label>
                                        {loadingSlots ? (
                                            <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
                                                <div className="spinner-small"></div>
                                                <span className="ml-3 text-gray-500">Chargement des créneaux...</span>
                                            </div>
                                        ) : availableSlots.length === 0 ? (
                                            <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
                                                <FiClock className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                                                <p className="text-sm font-medium text-yellow-800 mb-1">
                                                    Aucun créneau disponible
                                                </p>
                                                <p className="text-xs text-yellow-700">
                                                    Veuillez choisir une autre date
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                {availableSlots.map((slot) => (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                                                            selectedSlot === slot
                                                                ? 'bg-teal-500 text-white border-teal-500 shadow-md scale-105'
                                                                : 'bg-white text-gray-700 border-gray-300 hover:border-teal-300 hover:bg-teal-50 hover:scale-105'
                                                        }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reason */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Motif de la consultation (optionnel)
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[100px] transition-all outline-none text-gray-700 placeholder:text-gray-400 resize-none"
                                        placeholder="Décrivez brièvement vos symptômes ou la raison de votre visite..."
                                        value={bookingData.reason}
                                        onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                                    />
                                </div>

                                {/* Summary */}
                                {selectedDate && selectedSlot && (
                                    <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                            <FiCheck className="w-5 h-5 mr-2 text-teal-600" />
                                            Récapitulatif
                                        </h4>
                                        <div className="space-y-1 text-sm text-gray-700">
                                            <p><span className="font-medium">Date:</span> {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            <p><span className="font-medium">Heure:</span> {selectedSlot}</p>
                                            {selectedDoctor.profileQuestions?.consultationFee && (
                                                <p><span className="font-medium">Tarif:</span> {selectedDoctor.profileQuestions.consultationFee} TND</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setSelectedDate('');
                                            setSelectedSlot('');
                                            setAvailableSlots([]);
                                        }}
                                        disabled={submitting}
                                        className="sm:px-8"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={handleBook}
                                        disabled={!selectedDate || !selectedSlot || submitting}
                                        className="sm:px-10"
                                    >
                                        {submitting ? 'Réservation en cours...' : 'Confirmer la réservation'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Modal>
                </div>
            </div>
        </Layout>
    );
}
