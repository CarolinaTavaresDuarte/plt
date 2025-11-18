import React, { useEffect, useMemo, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { BAIRROS_SP } from '../constants/bairrosSP';

// Lightweight dashboard charts without external libs.
// Expected row fields (case-insensitive, alternatives handled):
// - risco: 'Alto' | 'Moderado' | 'Baixo'
// - faixa etária: 'faixa_etaria' | 'faixaEtaria' | 'Faixa etária' | 'faixa'
// - bairro/região: 'bairro' | 'Bairro' | 'Região/Bairro' | 'regiao_bairro' | 'regiaoBairro'
// - data: 'data' | 'Data' | 'created_at' (supports dd/mm/yyyy or ISO)

function normalizeDate(str) {
  if (!str) return null;
  const s = String(str).trim();
  // dd/mm/yyyy
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const y = Number(m[3]);
    const dt = new Date(y, mo, d);
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toKeyDate(dt) {
  return dt.toISOString().slice(0, 10);
}

const COLORS = {
  Alto: '#e34d4d',
  Moderado: '#f0ad4e',
  Baixo: '#2ea97d',
};

const TEST_NAME_MAP = {
  mchat: 'M-CHAT-R/F',
  assq: 'ASSQ',
  aq10: 'AQ-10',
  ados2: 'ADOS-2',
  adir: 'ADI-R',
};

const RISK_BADGES = {
  Alto: { color: '#b42318', background: 'rgba(227,77,77,.16)', borderColor: 'rgba(227,77,77,.45)' },
  Moderado: { color: '#9c6b04', background: 'rgba(240,173,78,.16)', borderColor: 'rgba(240,173,78,.4)' },
  Baixo: { color: '#0e7a4b', background: 'rgba(46,169,125,.16)', borderColor: 'rgba(46,169,125,.35)' },
};

const getRiskStyle = (level) => ({
  color: RISK_BADGES[level]?.color || '#0f172a',
  background: RISK_BADGES[level]?.background || 'rgba(15,23,42,.08)',
  borderColor: RISK_BADGES[level]?.borderColor || 'rgba(15,23,42,.12)',
});

const getTestLabel = (type) => {
  if (!type) return 'Teste';
  return TEST_NAME_MAP[type] || type.toUpperCase();
};

const formatDateLabel = (value) => {
  const d = normalizeDate(value);
  if (!d) return '-';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCpf = (value = '') => {
  const digits = String(value).replace(/\D/g, '');
  if (digits.length !== 11) return value;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

// Internal charts component (exported as default)
function Charts({ data = [] }) {
  const { riskCounts, ageGroups, topHoods, trend } = useMemo(() => {
    const riskCounts = { Alto: 0, Moderado: 0, Baixo: 0 };
    const ageMap = new Map();
    const hoodMap = new Map();
    const dateMap = new Map();

    data.forEach((row) => {
      const risk = row.risco || row.Risco || row.risk;
      const age = row['Faixa etária'] || row.faixa_etaria || row.faixaEtaria || row.faixa || 'Não informado';
      const hood = row['Região/Bairro'] || row.bairro || row.Bairro || row.regiao_bairro || row.regiaoBairro;
      const dateStr = row.Data || row.data || row.created_at;

      if (risk && Object.prototype.hasOwnProperty.call(riskCounts, risk)) {
        riskCounts[risk] += 1;
      }

      if (!ageMap.has(age)) ageMap.set(age, { faixa: age, Alto: 0, Moderado: 0, Baixo: 0 });
      if (risk && ageMap.get(age)[risk] !== undefined) ageMap.get(age)[risk] += 1;

      if (risk === 'Alto' && hood) hoodMap.set(hood, (hoodMap.get(hood) || 0) + 1);

      const dt = normalizeDate(dateStr);
      if (dt) {
        const key = toKeyDate(dt);
        if (!dateMap.has(key)) dateMap.set(key, { date: key, total: 0, alto: 0 });
        const rec = dateMap.get(key);
        rec.total += 1;
        if (risk === 'Alto') rec.alto += 1;
      }
    });

    const ageGroups = Array.from(ageMap.values());
    const topHoods = Array.from(hoodMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    const trend = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return { riskCounts, ageGroups, topHoods, trend };
  }, [data]);

  const total = Math.max(1, (riskCounts.Alto + riskCounts.Moderado + riskCounts.Baixo));
  const pct = {
    Alto: (riskCounts.Alto / total) * 100,
    Moderado: (riskCounts.Moderado / total) * 100,
    Baixo: (riskCounts.Baixo / total) * 100,
  };

  // Build conic-gradient for donut
  const donutStyle = {
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: `conic-gradient(${COLORS.Alto} 0% ${pct.Alto}%, ${COLORS.Moderado} ${pct.Alto}% ${pct.Alto + pct.Moderado}%, ${COLORS.Baixo} ${pct.Alto + pct.Moderado}% 100%)`,
    position: 'relative',
  };

  const donutHoleStyle = {
    position: 'absolute',
    inset: 20,
    background: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
  };

  const card = { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 };

  const legendItem = (label, value, color) => (
    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 10, height: 10, background: color, borderRadius: 2 }} />
      <span style={{ fontSize: 13 }}>{label}: <strong>{value}</strong></span>
    </div>
  );

  // Trend line SVG points
  function TrendChart({ items }) {
    const w = 640; const h = 220; const pad = 24;
    if (!items || items.length === 0) {
      return <div style={{ color: '#6b7280', padding: '16px 0' }}>Sem dados suficientes para mostrar a tendência.</div>;
    }
    const maxY = Math.max(1, ...items.map((d) => Math.max(d.total, d.alto)));
    const step = items.length > 1 ? (w - pad * 2) / (items.length - 1) : 0;
    const y = (v) => h - pad - ((h - pad * 2) * (v / maxY));
    const x = (i) => pad + step * i;
    const hasOne = items.length === 1;
    const line = (key) => {
      if (hasOne) {
        const yv = y(items[0][key]);
        return `${pad},${yv} ${w - pad},${yv}`; // linha horizontal para 1 ponto
      }
      return items.map((d, i) => `${x(i)},${y(d[key])}`).join(' ');
    };
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 260 }}>
        <rect x="0" y="0" width={w} height={h} fill="#fff" />
        <polyline fill="none" stroke="#dde3ea" strokeWidth="1" points={`${pad},${h - pad} ${w - pad},${h - pad}`} />
        <polyline fill="none" stroke="#4e73df" strokeWidth="2" points={line('total')} />
        <polyline fill="none" stroke={COLORS.Alto} strokeWidth="2" points={line('alto')} />
        {hasOne && (
          <>
            <circle cx={(w) / 2} cy={y(items[0].total)} r="3" fill="#4e73df" />
            <circle cx={(w) / 2} cy={y(items[0].alto)} r="3" fill={COLORS.Alto} />
          </>
        )}
      </svg>
    );
  }

  // Grouped bars by age (Alto/Moderado/Baixo)
  function AgeBars({ items }) {
    const maxY = Math.max(1, ...items.map((r) => Math.max(r.Alto, r.Moderado, r.Baixo)));
    const barW = 18; const gap = 8; const groupGap = 18;
    return (
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'end', gap: groupGap, minHeight: 220 }}>
          {items.map((g) => (
            <div key={g.faixa} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'end', gap }}>
                {['Alto','Moderado','Baixo'].map((k) => (
                  <div key={k} title={`${k}: ${g[k]}`} style={{ width: barW, height: 4 + (160 * (g[k] / maxY)), background: COLORS[k], borderRadius: 4 }} />
                ))}
              </div>
              <div style={{ fontSize: 12, marginTop: 8, maxWidth: 120, textAlign: 'center' }}>{g.faixa}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal bars Top 5 neighborhoods (Alto)
  function HoodBars({ items }) {
    const max = Math.max(1, ...items.map((d) => d.value));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((d) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 140, fontSize: 13 }}>{d.name}</div>
            <div style={{ flex: 1, background: '#eef2f7', borderRadius: 6, height: 16, position: 'relative' }}>
              <div style={{ width: `${(d.value / max) * 100}%`, background: COLORS.Alto, height: '100%', borderRadius: 6 }} />
            </div>
            <div style={{ width: 24, textAlign: 'right', fontSize: 13 }}>{d.value}</div>
          </div>
        ))}
      </div>
    );
  }

  const empty = !data || data.length === 0;

  return (
    <div style={grid}>
      {empty ? (
        <div style={card}>Nenhum dado para exibir.</div>
      ) : (
        <>
          <section style={card}>
            <h3 style={{ margin: 0, marginBottom: 12 }}>Distribuição de Risco</h3>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 200, height: 200 }}>
                <div style={donutStyle} />
                <div style={donutHoleStyle}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Total</div>
                    <div style={{ fontSize: 20 }}>{riskCounts.Alto + riskCounts.Moderado + riskCounts.Baixo}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 6 }}>
                {legendItem('Alto', riskCounts.Alto, COLORS.Alto)}
                {legendItem('Moderado', riskCounts.Moderado, COLORS.Moderado)}
                {legendItem('Baixo', riskCounts.Baixo, COLORS.Baixo)}
              </div>
            </div>
          </section>

          <section style={card}>
            <h3 style={{ margin: 0, marginBottom: 12 }}>Risco por Faixa Etária</h3>
            <AgeBars items={ageGroups} />
          </section>

          <section style={card}>
            <h3 style={{ margin: 0, marginBottom: 12 }}>Top 5 Bairros (Alto Risco)</h3>
            <HoodBars items={topHoods} />
          </section>

          <section style={card}>
            <h3 style={{ margin: 0, marginBottom: 12 }}>Tendência por Data</h3>
            <TrendChart items={trend} />
          </section>
        </>
      )}
    </div>
  );
}

// Specialist dashboard with table + filters + charts
export function SpecialistDashboard() {
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ Alto: 0, Moderado: 0, Baixo: 0 });

  const [bairro, setBairro] = useState('');
  const [teste, setTeste] = useState('');
  const [risco, setRisco] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/api/v1/tests/especialista/dashboard');
        if (!alive) return;
        const data = res.data || {};
        const pacientes = data.pacientes || [];
        setRows(
          pacientes.map((p) => ({
            nome: p.nome_completo,
            faixa_etaria: p.faixa_etaria,
            regiao_bairro: p.regiao_bairro,
            contato: p.contato_principal,
            risco: p.risco,
            teste: p.teste_tipo,
            data: p.data,
          }))
        );
        const tr = data.totais_por_risco || {};
        setTotals({ Alto: tr.Alto || 0, Moderado: tr.Moderado || 0, Baixo: tr.Baixo || 0 });
      } catch (e) {
        if (!alive) return;
        setError('Não foi possível carregar os dados.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [api]);

  const filtered = useMemo(() => {
    const start = inicio ? normalizeDate(inicio) : null;
    const end = fim ? normalizeDate(fim) : null;
    return rows.filter((r) => {
      if (bairro && String(r.regiao_bairro || '').toLowerCase() !== String(bairro).toLowerCase()) return false;
      if (teste && String(r.teste || '').toLowerCase() !== String(teste).toLowerCase()) return false;
      if (risco && r.risco !== risco) return false;
      if (start || end) {
        const d = normalizeDate(r.data);
        if (!d) return false;
        if (start && d < start) return false;
        if (end) {
          const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
          if (d > endDay) return false;
        }
      }
      return true;
    });
  }, [rows, bairro, teste, risco, inicio, fim]);

  const totalCasos = totals.Alto + totals.Moderado + totals.Baixo;

  const thS = { textAlign: 'left', padding: '10px 12px', color: '#0f172a', fontWeight: 700 };
  const tdS = { padding: '10px 12px', borderTop: '1px solid #eef2f7', verticalAlign: 'top' };
  const testLabel = (t) => (t === 'mchat' ? 'M-CHAT' : t === 'assq' ? 'ASSQ' : t === 'aq10' ? 'AQ-10' : String(t || '').toUpperCase());

  return (
    <section className="section" id="specialist-dashboard">
      <div className="container">
        <h2 className="section-title">Panorama de triagens</h2>
        <p className="section-subtitle">Visualize rapidamente o panorama dos pacientes triados e acesse filtros estratégicos para tomada de decisão.</p>

        {(() => {
          const metricStyle = {
            background: 'linear-gradient(180deg, #eef6ff 0%, #ffffff 100%)',
            border: '1px solid #e5eeff',
            boxShadow: '0 12px 28px rgba(28, 63, 170, 0.08)',
            borderRadius: 16,
            padding: 20,
            textAlign: 'center',
          };
          const labelStyle = { color: '#5b6b88', fontWeight: 500 };
          const valueStyle = { fontSize: 30, fontWeight: 800, color: '#0f2454' };
          return (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 16 }}>
              <div className="card" style={metricStyle}>
                <div style={labelStyle}>Alto</div>
                <div style={valueStyle}>{totals.Alto}</div>
              </div>
              <div className="card" style={metricStyle}>
                <div style={labelStyle}>Moderado</div>
                <div style={valueStyle}>{totals.Moderado}</div>
              </div>
              <div className="card" style={metricStyle}>
                <div style={labelStyle}>Baixo</div>
                <div style={valueStyle}>{totals.Baixo}</div>
              </div>
              <div className="card" style={metricStyle}>
                <div style={labelStyle}>Total de casos</div>
                <div style={valueStyle}>{totalCasos}</div>
              </div>
            </div>
          );
        })()}

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'end' }}>
            <div>
              <label>Filtro por bairro (SP)</label>
              <select value={bairro} onChange={(e) => setBairro(e.target.value)}>
                <option value="">Todos</option>
                {BAIRROS_SP.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Data in{String.fromCharCode(237)}cio</label>
              <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div>
              <label>Data fim</label>
              <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
            <div>
              <label>Filtro por teste</label>
              <select value={teste} onChange={(e) => setTeste(e.target.value)}>
                <option value="">Todos</option>
                <option value="mchat">M-CHAT</option>
                <option value="assq">ASSQ</option>
                <option value="aq10">AQ-10</option>
              </select>
            </div>
            <div>
              <label>Filtro por risco</label>
              <select value={risco} onChange={(e) => setRisco(e.target.value)}>
                <option value="">Todos</option>
                <option value="Alto">Alto</option>
                <option value="Moderado">Moderado</option>
                <option value="Baixo">Baixo</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            {loading && <div>Carregando...</div>}
            {error && <div className="alert alert-error">{error}</div>}
            {!loading && !error && (
              <table className="table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                <colgroup>
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '16%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '12%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={thS}>Nome</th>
                    <th style={thS}>Faixa etária</th>
                    <th style={thS}>Região/Bairro</th>
                    <th style={thS}>Contato</th>
                    <th style={thS}>Risco</th>
                    <th style={thS}>Teste</th>
                    <th style={thS}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => (
                    <tr key={idx}>
                      <td style={tdS}>{r.nome}</td>
                      <td style={tdS}>{r.faixa_etaria}</td>
                      <td style={tdS}>{r.regiao_bairro}</td>
                      <td style={{ ...tdS, whiteSpace: 'nowrap' }}>{r.contato}</td>
                      <td style={tdS}>{r.risco}</td>
                      <td style={{ ...tdS, whiteSpace: 'nowrap' }}>{testLabel(r.teste)}</td>
                      <td style={{ ...tdS, whiteSpace: 'nowrap' }}>{(() => {
                        const d = normalizeDate(r.data);
                        return d ? d.toLocaleDateString('pt-BR') : '-';
                      })()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Charts below the table */}
        <Charts data={filtered} />
      </div>
    </section>
  );
}

// Simple patient dashboard placeholder (can be expanded later)
export function PatientDashboard() {
  const api = useApi();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const res = await api.get('/api/v1/tests/responsavel/resultados');
        if (!active) return;
        setPacientes(res.data?.pacientes || []);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError('Não foi possível carregar seus resultados agora.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [api]);

  return (
    <section className="section" id="patient-dashboard">
      <div className="container">
        <h2 className="section-title">Meus resultados</h2>
        <p className="section-subtitle">Acompanhe suas triagens e orientações personalizadas.</p>

        {loading && <div className="card">Carregando seus resultados...</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && pacientes.length === 0 && (
          <div className="card">
            Você ainda não finalizou nenhuma triagem. Assim que concluir um teste, os resultados aparecerão aqui.
          </div>
        )}

        {!loading && !error && pacientes.length > 0 && (
          <div className="patient-results-grid">
            {pacientes.map((paciente) => {
              const latest = paciente.resultados?.[0];
              return (
                <article key={paciente.cpf} className="card patient-result-card">
                  <header className="patient-result-card__header">
                    <div>
                      <h3>{paciente.nome}</h3>
                      <p>
                        {formatCpf(paciente.cpf)}
                        {paciente.regiao_bairro ? ` · ${paciente.regiao_bairro}` : ''}
                      </p>
                    </div>
                    {latest && (
                      <span className="risk-pill" style={getRiskStyle(latest.risco)}>
                        {latest.risco}
                      </span>
                    )}
                  </header>

                  <div className="patient-result-card__body">
                    {paciente.resultados.map((resultado, idx) => (
                      <div key={`${paciente.cpf}-${resultado.teste_tipo}-${idx}`} className="patient-result-card__entry">
                        <div className="patient-result-card__entry-head">
                          <div>
                            <strong>{getTestLabel(resultado.teste_tipo)}</strong>
                            <small>
                              {formatDateLabel(resultado.data)}
                              {typeof resultado.score === 'number' ? ` · Score ${resultado.score}` : ''}
                            </small>
                          </div>
                          <span className="risk-pill" style={getRiskStyle(resultado.risco)}>
                            {resultado.risco}
                          </span>
                        </div>
                        <p className="patient-result-card__orientation">{resultado.orientacao}</p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Charts;
