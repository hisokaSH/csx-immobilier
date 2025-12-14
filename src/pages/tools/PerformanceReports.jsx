import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Home,
  Calendar,
  Download,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw
} from 'lucide-react';

function PerformanceReports() {
  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('overview');

  const stats = {
    views: { value: 4523, change: 12.5, label: 'Vues totales' },
    leads: { value: 87, change: 8.3, label: 'Nouveaux leads' },
    visits: { value: 34, change: -5.2, label: 'Visites effectuées' },
    sales: { value: 6, change: 20, label: 'Ventes conclues' },
  };

  const listingPerformance = [
    { id: 1, title: 'Appartement T3 Vue Mer', views: 456, leads: 12, visits: 5, status: 'hot' },
    { id: 2, title: 'Villa 5p avec piscine', views: 389, leads: 8, visits: 4, status: 'warm' },
    { id: 3, title: 'Studio rénové centre', views: 234, leads: 5, visits: 2, status: 'normal' },
    { id: 4, title: 'Maison 4p jardin', views: 178, leads: 3, visits: 1, status: 'cold' },
  ];

  const weeklyData = [
    { day: 'Lun', views: 120, leads: 8 },
    { day: 'Mar', views: 145, leads: 12 },
    { day: 'Mer', views: 98, leads: 6 },
    { day: 'Jeu', views: 167, leads: 15 },
    { day: 'Ven', views: 189, leads: 18 },
    { day: 'Sam', views: 234, leads: 22 },
    { day: 'Dim', views: 156, leads: 10 },
  ];

  const sourceData = [
    { source: 'SeLoger', percentage: 35, color: '#3b82f6' },
    { source: 'LeBonCoin', percentage: 28, color: '#f97316' },
    { source: 'Site web', percentage: 22, color: 'var(--gold)' },
    { source: 'Facebook', percentage: 10, color: '#8b5cf6' },
    { source: 'Autres', percentage: 5, color: '#6b7280' },
  ];

  const maxViews = Math.max(...weeklyData.map(d => d.views));

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BarChart3 size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Performance</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Analysez vos résultats et optimisez vos performances
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '10px 16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              cursor: 'pointer',
            }}>
              <Download size={16} />
              Exporter
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'var(--gold)',
              border: 'none',
              borderRadius: '8px',
              color: 'var(--bg-primary)',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
            }}>
              <Mail size={16} />
              Envoyer rapport
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {Object.entries(stats).map(([key, stat]) => (
          <div key={key} style={{
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: stat.change >= 0 ? '#22c55e' : '#ef4444',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                {stat.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700' }}>{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Weekly Chart */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px' }}>
            Activité de la semaine
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingBottom: '30px' }}>
            {weeklyData.map((day, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', gap: '4px' }}>
                  <div style={{
                    width: '24px',
                    height: `${(day.views / maxViews) * 150}px`,
                    background: 'linear-gradient(180deg, var(--gold) 0%, rgba(212, 175, 55, 0.5) 100%)',
                    borderRadius: '4px 4px 0 0',
                  }} />
                  <div style={{
                    width: '24px',
                    height: `${(day.leads / 25) * 150}px`,
                    background: 'linear-gradient(180deg, #3b82f6 0%, rgba(59, 130, 246, 0.5) 100%)',
                    borderRadius: '4px 4px 0 0',
                  }} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{day.day}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--gold)', borderRadius: '2px' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vues</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Leads</span>
            </div>
          </div>
        </div>

        {/* Sources */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px' }}>
            Sources de trafic
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sourceData.map((source, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>{source.source}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: source.color }}>{source.percentage}%</span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${source.percentage}%`,
                    height: '100%',
                    background: source.color,
                    borderRadius: '4px',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listing Performance */}
      <div style={{
        padding: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Performance par annonce</h3>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            cursor: 'pointer',
          }}>
            <Filter size={14} />
            Filtrer
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 0', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Annonce</th>
              <th style={{ padding: '12px 0', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vues</th>
              <th style={{ padding: '12px 0', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Leads</th>
              <th style={{ padding: '12px 0', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Visites</th>
              <th style={{ padding: '12px 0', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Conversion</th>
              <th style={{ padding: '12px 0', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {listingPerformance.map((listing, idx) => {
              const conversion = ((listing.leads / listing.views) * 100).toFixed(1);
              return (
                <tr key={listing.id} style={{ borderBottom: idx < listingPerformance.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <td style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Home size={18} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>{listing.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Eye size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontWeight: '600' }}>{listing.views}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Users size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontWeight: '600' }}>{listing.leads}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontWeight: '600' }}>{listing.visits}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      background: parseFloat(conversion) >= 3 ? 'rgba(34, 197, 94, 0.1)' : parseFloat(conversion) >= 2 ? 'rgba(212, 175, 55, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: parseFloat(conversion) >= 3 ? '#22c55e' : parseFloat(conversion) >= 2 ? 'var(--gold)' : '#ef4444',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}>
                      {conversion}%
                    </span>
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: listing.status === 'hot' ? 'rgba(239, 68, 68, 0.1)' :
                                 listing.status === 'warm' ? 'rgba(249, 115, 22, 0.1)' :
                                 listing.status === 'normal' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: listing.status === 'hot' ? '#ef4444' :
                             listing.status === 'warm' ? '#f97316' :
                             listing.status === 'normal' ? '#22c55e' : '#6b7280',
                    }}>
                      {listing.status === 'hot' ? '🔥 Très demandé' :
                       listing.status === 'warm' ? '☀️ Populaire' :
                       listing.status === 'normal' ? '✓ Normal' : '❄️ Faible'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PerformanceReports;
