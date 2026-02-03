import React, { useState, useEffect } from 'react';
import api from '../api';
import { FileText, Search, Filter } from 'lucide-react';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/logs');
            setLogs(response.data);
        } catch (error) {
            console.error('Fetch logs error', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Logs d'Activité</h1>
                    <p className="text-slate-500">Historique des événements du système (UC5)</p>
                </div>
            </header>

            <div className="glass rounded-3xl shadow-lg border border-white/40 overflow-hidden">
                <div className="p-6 bg-slate-50/50 border-b border-slate-200/50 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un événement..."
                            className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <button className="flex items-center px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-blue-300 transition-all">
                        <Filter className="w-4 h-4 mr-2" /> Filtrer
                    </button>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Date & Heure</th>
                                <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Source</th>
                                <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="4" className="px-8 py-10 text-center text-slate-400">Chargement...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="4" className="px-8 py-10 text-center text-slate-400">Aucun log disponible.</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5 text-slate-500 font-mono text-sm">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${log.action.includes('CREATE') ? 'text-blue-700 bg-blue-50' :
                                                log.action.includes('TRIGGER') ? 'text-purple-700 bg-purple-50' : 'text-slate-700 bg-slate-100'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-slate-600 font-semibold">{log.source}</td>
                                    <td className="px-8 py-5 text-slate-500 italic">{log.message || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Logs;
