import React, { useState } from 'react';
import './App.css';

const currentYear = new Date().getFullYear();
const defaultYears = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];

function formatNumber(value) {
  return Number(value).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function App() {
  const [years, setYears] = useState(defaultYears);
  const [columns, setColumns] = useState(['Ingresos', 'Gastos']);
  const [data, setData] = useState({});
  const [results, setResults] = useState(null);

  // ── Years ──────────────────────────────────────────────
  const addYear = () => {
    const next = Math.max(...years) + 1;
    setYears([...years, next]);
  };

  const removeYear = (year) => {
    if (years.length <= 1) return;
    setYears(years.filter((y) => y !== year));
    setData((prev) => {
      const copy = { ...prev };
      delete copy[year];
      return copy;
    });
    setResults(null);
  };

  // ── Columns ────────────────────────────────────────────
  const addColumn = () => {
    setColumns([...columns, `Columna ${columns.length + 1}`]);
  };

  const removeColumn = (index) => {
    if (columns.length <= 1) return;
    const oldName = columns[index];
    const newColumns = columns.filter((_, i) => i !== index);
    setData((prev) => {
      const copy = {};
      for (const year of Object.keys(prev)) {
        copy[year] = { ...prev[year] };
        delete copy[year][oldName];
      }
      return copy;
    });
    setColumns(newColumns);
    setResults(null);
  };

  const renameColumn = (index, newName) => {
    const oldName = columns[index];
    const newColumns = [...columns];
    newColumns[index] = newName;
    setData((prev) => {
      const copy = {};
      for (const year of Object.keys(prev)) {
        copy[year] = {};
        for (const col of Object.keys(prev[year])) {
          copy[year][col === oldName ? newName : col] = prev[year][col];
        }
      }
      return copy;
    });
    setColumns(newColumns);
    setResults(null);
  };

  // ── Cell data ──────────────────────────────────────────
  const updateCell = (year, col, value) => {
    setData((prev) => ({
      ...prev,
      [year]: { ...(prev[year] || {}), [col]: value },
    }));
    setResults(null);
  };

  // ── Calculate ──────────────────────────────────────────
  const calculate = () => {
    const sorted = [...years].sort((a, b) => a - b);
    const rows = [];

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const row = { label: `${prev} → ${curr}` };

      for (const col of columns) {
        const prevVal = parseFloat(data[prev]?.[col]) || 0;
        const currVal = parseFloat(data[curr]?.[col]) || 0;
        const diff = currVal - prevVal;
        const pct = prevVal !== 0 ? (diff / Math.abs(prevVal)) * 100 : null;
        row[col] = { diff, pct };
      }

      rows.push(row);
    }

    setResults(rows);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-icon">📊</div>
          <div>
            <h1>Calculadora de Indicadores</h1>
            <p>Análisis comparativo por período</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="card">
          <div className="card-title">Datos de entrada</div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="year-col-header">Año</th>
                  {columns.map((col, i) => (
                    <th key={i} className="data-col-header">
                      <div className="th-inner">
                        <input
                          className="col-name-input"
                          value={col}
                          onChange={(e) => renameColumn(i, e.target.value)}
                          title="Editar nombre de columna"
                        />
                        {columns.length > 1 && (
                          <button
                            className="btn-remove-col"
                            onClick={() => removeColumn(i)}
                            title="Eliminar columna"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="add-col-th">
                    <button className="btn-add-col" onClick={addColumn}>
                      + Columna
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...years].sort((a, b) => a - b).map((year) => (
                  <tr key={year}>
                    <td className="year-cell">
                      <span className="year-label">{year}</span>
                      {years.length > 1 && (
                        <button
                          className="btn-remove-year"
                          onClick={() => removeYear(year)}
                          title="Eliminar año"
                        >
                          ×
                        </button>
                      )}
                    </td>
                    {columns.map((col, i) => (
                      <td key={i} className="input-cell">
                        <input
                          type="number"
                          className="cell-input"
                          value={data[year]?.[col] ?? ''}
                          onChange={(e) => updateCell(year, col, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <button className="btn-add-year" onClick={addYear}>
              + Agregar año
            </button>
          </div>
        </div>

        <div className="calculate-row">
          <button className="btn-calculate" onClick={calculate}>
            Calcular
          </button>
        </div>

        {results && (
          <div className="card results-card">
            <div className="card-title">Indicadores</div>

            <div className="table-scroll">
              <table className="results-table">
                <thead>
                  <tr>
                    <th className="period-header">Período</th>
                    {columns.map((col, i) => (
                      <React.Fragment key={i}>
                        <th className="result-header">
                          {col}
                          <br />
                          <span className="subheader">Variación</span>
                        </th>
                        <th className="result-header">
                          {col}
                          <br />
                          <span className="subheader">%</span>
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => (
                    <tr key={i}>
                      <td className="period-cell">{row.label}</td>
                      {columns.map((col, j) => {
                        const { diff, pct } = row[col];
                        const cls =
                          diff > 0 ? 'positive' : diff < 0 ? 'negative' : '';
                        return (
                          <React.Fragment key={j}>
                            <td className={`result-cell ${cls}`}>
                              {diff > 0 ? '+' : ''}
                              {formatNumber(diff)}
                            </td>
                            <td className={`result-cell ${cls}`}>
                              {pct !== null
                                ? `${diff > 0 ? '+' : ''}${pct.toFixed(2)}%`
                                : 'N/A'}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="legend">
              <span className="legend-item positive-legend">▲ Incremento</span>
              <span className="legend-item negative-legend">▼ Decremento</span>
              <span className="legend-item neutral-legend">— Sin cambio</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
