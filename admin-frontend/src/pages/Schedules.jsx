import React, { useState, useEffect } from 'react';
import api from '../api';
import { Calendar, Plus, Clock, Trash2, CheckCircle, XCircle } from 'lucide-react';

const Schedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [heure, setHeure] = useState('08:00');
    const [duree, setDuree] = useState(5);
    const [joursActifs, setJoursActifs] = useState([]);
    const [isHolidayException, setIsHolidayException] = useState(false);

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            const response = await api.get('/api/schedule');
            setSchedules(response.data);
        } catch (error) {
            console.error('Fetch error', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDay = (day) => {
        setJoursActifs(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update existing schedule
                await api.put(`/schedule/${editingId}`, {
                    heure: `${heure}:00`,
                    joursActifs,
                    duree,
                    isHolidayException
                });
            } else {
                // Create new schedule
                await api.post('/schedule', {
                    heure: `${heure}:00`,
                    joursActifs,
                    duree,
                    isHolidayException
                });
            }
            setShowForm(false);
            resetForm();
            fetchSchedules();
        } catch (error) {
            console.error('Submit error', error);
            alert('Erreur lors de l\'enregistrement du planning');
        }
    };

    const resetForm = () => {
        setHeure('08:00');
        setDuree(5);
        setJoursActifs([]);
        setIsHolidayException(false);
        setEditingId(null);
    };

    const handleEdit = (schedule) => {
        setEditingId(schedule.id);
        setHeure(schedule.heure.slice(0, 5)); // Remove seconds
        setDuree(schedule.duree);
        setJoursActifs(schedule.joursActifs);
        setIsHolidayException(schedule.isHolidayException);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet horaire ?')) return;

        try {
            await api.delete(`/schedule/${id}`);
            fetchSchedules();
        } catch (error) {
            console.error('Delete error', error);
            alert('Erreur lors de la suppression du planning');
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Programmation</h1>
                    <p className="text-slate-500">Gérez les horaires automatiques (UC2)</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center transition-all"
                >
                    {showForm ? <Trash2 className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                    {showForm ? 'Annuler' : (editingId ? 'Modifier l\'horaire' : 'Ajouter un horaire')}
                </button>
            </header>

            {showForm && (
                <div className="p-8 glass rounded-3xl shadow-lg border border-white/40 animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Heure de début</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="time"
                                        value={heure}
                                        onChange={(e) => setHeure(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Durée de la sonnerie (sec)</label>
                                <input
                                    type="number"
                                    value={duree}
                                    onChange={(e) => setDuree(parseInt(e.target.value))}
                                    min="1"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="holiday"
                                    checked={isHolidayException}
                                    onChange={(e) => setIsHolidayException(e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded border-slate-300"
                                />
                                <label htmlFor="holiday" className="text-sm font-semibold text-slate-700">Exception (Jour Férié / Vacances)</label>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="block text-sm font-semibold text-slate-700">Jours actifs</label>
                            <div className="grid grid-cols-2 gap-3">
                                {daysOfWeek.map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => handleToggleDay(day)}
                                        className={`px-4 py-3 rounded-xl border font-medium transition-all ${joursActifs.includes(day)
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-95"
                            >
                                {editingId ? 'METTRE À JOUR' : 'ENREGISTRER LE PLANNING'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass rounded-3xl shadow-lg border border-white/40 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-200/50">
                        <tr>
                            <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Heure</th>
                            <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Jours</th>
                            <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Durée</th>
                            <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-center">Statut</th>
                            <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="5" className="px-8 py-10 text-center text-slate-400">Chargement...</td></tr>
                        ) : schedules.length === 0 ? (
                            <tr><td colSpan="5" className="px-8 py-10 text-center text-slate-400">Aucun planning défini.</td></tr>
                        ) : schedules.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6 font-bold text-slate-900 text-xl">{s.heure.slice(0, 5)}</td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-wrap gap-2">
                                        {s.joursActifs.map(day => (
                                            <span key={day} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-tighter">
                                                {day.slice(0, 3)}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-slate-600 font-medium">{s.duree}s</td>
                                <td className="px-8 py-6">
                                    <div className="flex justify-center">
                                        {s.isHolidayException ? (
                                            <span className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-bold">
                                                <XCircle className="w-4 h-4 mr-1" /> EXCEPTION
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold">
                                                <CheckCircle className="w-4 h-4 mr-1" /> ACTIF
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(s)}
                                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                                        >
                                            <Clock className="w-4 h-4" />
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Supprimer
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Schedules;
