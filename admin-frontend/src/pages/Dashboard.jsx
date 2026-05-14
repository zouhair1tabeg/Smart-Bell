import React, { useState, useEffect } from 'react';
import api from '../api';
import '../index.css';

const Dashboard = () => {
    const [status, setStatus] = useState({
        system: 'operational',
        lastTrigger: null,
        nextSchedule: null,
        esp32Connected: false,
        loading: true
    });
    const [triggering, setTriggering] = useState(false);
    const [message, setMessage] = useState(null);
    const [stats, setStats] = useState({
        triggersToday: 0,
        triggersWeek: 0,
        activeSchedules: 0
    });

    useEffect(() => {
        loadDashboardData();
        // Refresh every 30 seconds
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            // Load stats from new endpoint
            const statsResponse = await api.get('/api/stats');
            const statsData = statsResponse.data;

            setStatus({
                system: 'operational',
                lastTrigger: statsData.last_trigger_timestamp, // Assuming stats endpoint provides this
                nextSchedule: statsData.next_schedule,
                esp32Connected: statsData.esp32_connected,
                loading: false
            });

            // Update statistics counts
            setStats({
                triggersToday: statsData.triggers_today,
                triggersWeek: statsData.triggers_week,
                activeSchedules: statsData.active_schedules
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
            setStatus(prev => ({ ...prev, loading: false, system: 'error' }));
        }
    };

    const handleManualTrigger = async () => {
        setTriggering(true);
        setMessage(null);

        try {
            await api.post('/trigger', { action: 'ON', duration: 5 });
            setMessage({ type: 'success', text: '✅ Sonnerie déclenchée avec succès !' });

            // Refresh dashboard after trigger
            setTimeout(() => {
                loadDashboardData();
                setMessage(null);
            }, 3000);
        } catch (error) {
            console.error('Error triggering bell:', error);
            setMessage({
                type: 'error',
                text: '❌ Erreur lors du déclenchement de la sonnerie. Vérifiez que le système est connecté.'
            });
        } finally {
            setTriggering(false);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString('fr-FR', {
            dateStyle: 'short',
            timeStyle: 'medium'
        });
    };

    const formatScheduleTime = (schedule) => {
        if (!schedule) return 'Aucun';
        const days = schedule.joursActifs?.join(', ') || 'Tous les jours';
        return `${schedule.heure} (${days})`;
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>🔔 Tableau de Bord SmartBell</h1>
                <div className="system-status">
                    <span className={`status-indicator ${status.system}`}></span>
                    <span className="status-text">
                        {status.system === 'operational' ? 'Système Opérationnel' : 'Système Hors Ligne'}
                    </span>
                </div>
            </div>

            {message && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="dashboard-grid">
                {/* Manual Trigger Card */}
                <div className="dashboard-card trigger-card">
                    <h2>Déclenchement Manuel</h2>
                    <p>Activez manuellement la sonnerie depuis cette interface</p>
                    <button
                        className="btn btn-primary btn-large"
                        onClick={handleManualTrigger}
                        disabled={triggering}
                    >
                        {triggering ? '⏳ Déclenchement...' : '🔔 SONNER MAINTENANT'}
                    </button>
                </div>

                {/* Status Card */}
                <div className="dashboard-card">
                    <h2>📊 État du Système</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Dernier déclenchement:</span>
                            <span className="info-value">{formatTime(status.lastTrigger)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Prochain horaire:</span>
                            <span className="info-value">{formatScheduleTime(status.nextSchedule)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">État de l'Arduino:</span>
                            <span className={`badge badge-${status.esp32Connected ? 'success' : 'danger'}`}>
                                {status.esp32Connected ? '✓ Connecté' : '✗ Déconnecté'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="dashboard-card">
                    <h2>⚡ Actions Rapides</h2>
                    <div className="quick-actions">
                        <a href="/schedules" className="quick-action-btn">
                            <span className="action-icon">📅</span>
                            <span className="action-text">Gérer les Horaires</span>
                        </a>
                        <a href="/logs" className="quick-action-btn">
                            <span className="action-icon">📜</span>
                            <span className="action-text">Consulter les Logs</span>
                        </a>
                    </div>
                </div>

                {/* Statistics Card */}
                <div className="dashboard-card">
                    <h2>📈 Statistiques</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">{stats.triggersToday}</div>
                            <div className="stat-label">Déclenchements aujourd'hui</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{stats.activeSchedules}</div>
                            <div className="stat-label">Horaires actifs</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
