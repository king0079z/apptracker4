import React, { useState, useMemo, useEffect } from 'react';
import { useTable, useFilters, useSortBy, usePagination, useGlobalFilter } from 'react-table';

const formatHours = (decimalHours) => {
  if (!decimalHours || decimalHours === 0) return '0:00:00';

  const totalSeconds = Math.floor(decimalHours * 3600);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

const DefaultColumnFilter = ({ 
  column: { filterValue, preFilteredRows, setFilter, Header } 
}) => {
  const count = preFilteredRows.length;
  
  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined);
      }}
      placeholder={`Search ${Header}...`}
      className="column-filter"
      title={`Filter by ${Header}`}
    />
  );
};

const GlobalFilter = ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) => {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter);

  // Update local state when global filter changes
  useEffect(() => {
    setValue(globalFilter);
  }, [globalFilter]);

  return (
    <div className="global-filter">
      <input
        value={value || ""}
        onChange={e => {
          setValue(e.target.value);
          setGlobalFilter(e.target.value || undefined);
        }}
        placeholder={`Search ${count} records...`}
        className="global-search"
      />
    </div>
  );
};

const UsageTable = ({ 
  data, 
  loading = false, 
  columns: customColumns = null,
  showPagination = true,
  showGlobalFilter = true,
  pageSize: initialPageSize = 10
}) => {
  const [exportLoading, setExportLoading] = useState(false);

  const defaultColumns = useMemo(
    () => [
      {
        Header: 'Application',
        accessor: 'app',
        Cell: ({ value }) => (
          <div className="app-cell">
            <span className="app-icon">📱</span>
            <span className="app-name">{value}</span>
          </div>
        ),
      },
      {
        Header: 'Total Hours',
        accessor: 'total_hours',
        Cell: ({ value }) => (
          <div className="hours-cell">
            <span className="hours-formatted">{formatHours(value)}</span>
            <span className="hours-decimal">({value?.toFixed(2)}h)</span>
          </div>
        ),
        sortType: 'basic',
      },
      {
        Header: 'Sessions',
        accessor: 'usage_count',
        Cell: ({ value }) => (
          <div className="sessions-cell">
            <span className="session-count">{value}</span>
            <span className="session-label">sessions</span>
          </div>
        ),
      },
      {
        Header: 'Avg Session',
        accessor: 'avg_session',
        Cell: ({ row }) => {
          const totalHours = row.original.total_hours || 0;
          const sessionCount = row.original.usage_count || 0;
          const avgSession = sessionCount > 0 ? totalHours / sessionCount : 0;
          return (
            <div className="avg-session-cell">
              {formatHours(avgSession)}
            </div>
          );
        },
        disableFilters: true,
      },
      {
        Header: 'Computer',
        accessor: 'computerName',
        Cell: ({ value }) => (
          <div className="computer-cell">
            <span className="computer-icon">💻</span>
            <span>{value}</span>
          </div>
        ),
      },
      {
        Header: 'IP Address',
        accessor: 'ipAddress',
        Cell: ({ value }) => (
          <code className="ip-address">{value}</code>
        ),
      },
      {
        Header: 'User',
        accessor: 'username',
        Cell: ({ value }) => (
          <div className="user-cell">
            <span className="user-icon">👤</span>
            <span>{value}</span>
          </div>
        ),
      },
      {
        Header: 'Last Activity',
        accessor: 'lastActivity',
        Cell: ({ value }) => (
          <div className="activity-cell">
            {formatDate(value)}
          </div>
        ),
        disableFilters: true,
      },
    ],
    []
  );

  const columns = customColumns || defaultColumns;

  const defaultColumn = useMemo(() => ({
    Filter: DefaultColumnFilter,
  }), []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, globalFilter },
    preGlobalFilteredRows,
    setGlobalFilter,
    rows,
  } = useTable(
    { 
      columns, 
      data, 
      defaultColumn,
      initialState: { 
        pageIndex: 0, 
        pageSize: initialPageSize,
        sortBy: [
          {
            id: 'total_hours',
            desc: true
          }
        ]
      }
    }, 
    useGlobalFilter,
    useFilters, 
    useSortBy,
    usePagination
  );

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      // Prepare data for export
      const exportData = rows.map(row => {
        const rowData = {};
        columns.forEach(column => {
          if (column.accessor) {
            rowData[column.Header] = row.original[column.accessor];
          }
        });
        return rowData;
      });

      // Convert to CSV
      const csvContent = [
        columns.map(col => col.Header).join(','),
        ...exportData.map(row => 
          columns.map(col => {
            const value = row[col.Header];
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `usage-data-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const getSummaryStats = () => {
    const totalHours = rows.reduce((sum, row) => sum + (row.original.total_hours || 0), 0);
    const totalSessions = rows.reduce((sum, row) => sum + (row.original.usage_count || 0), 0);
    const uniqueApps = new Set(rows.map(row => row.original.app)).size;
    const uniqueUsers = new Set(rows.map(row => row.original.username)).size;
    
    return {
      totalHours,
      totalSessions,
      uniqueApps,
      uniqueUsers,
      avgSessionTime: totalSessions > 0 ? totalHours / totalSessions : 0
    };
  };

  const summaryStats = getSummaryStats();

  if (loading) {
    return (
      <div className="table-container loading-overlay">
        <div className="loading-spinner"></div>
        <div style={{ height: '400px', background: '#f8f9fa' }}></div>
      </div>
    );
  }

  return (
    <div className="enhanced-table-container">
      {/* Table Header Controls */}
      <div className="table-header">
        <div className="table-title">
          <h3>Usage Statistics</h3>
          <span className="record-count">
            Showing {page.length} of {rows.length} records
          </span>
        </div>
        
        <div className="table-controls">
          {showGlobalFilter && (
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
          )}
          
          <button 
            className="btn btn-success btn-sm"
            onClick={handleExportCSV}
            disabled={exportLoading}
          >
            {exportLoading ? '📤 Exporting...' : '📤 Export CSV'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="table-summary">
        <div className="summary-stat">
          <span className="summary-value">{summaryStats.totalHours.toFixed(2)}</span>
          <span className="summary-label">Total Hours</span>
        </div>
        <div className="summary-stat">
          <span className="summary-value">{summaryStats.totalSessions}</span>
          <span className="summary-label">Total Sessions</span>
        </div>
        <div className="summary-stat">
          <span className="summary-value">{summaryStats.uniqueApps}</span>
          <span className="summary-label">Unique Apps</span>
        </div>
        <div className="summary-stat">
          <span className="summary-value">{summaryStats.uniqueUsers}</span>
          <span className="summary-label">Users</span>
        </div>
        <div className="summary-stat">
          <span className="summary-value">{formatHours(summaryStats.avgSessionTime)}</span>
          <span className="summary-label">Avg Session</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table table-striped table-bordered enhanced-table" {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>
                    <div className="header-content">
                      <div 
                        {...column.getSortByToggleProps()}
                        className="header-sort"
                        title={`Sort by ${column.Header}`}
                      >
                        {column.render('Header')}
                        <span className="sort-indicator">
                          {column.isSorted
                            ? column.isSortedDesc
                              ? ' 🔽'
                              : ' 🔼'
                            : ' ↕️'}
                        </span>
                      </div>
                      <div className="header-filter">
                        {column.canFilter ? column.render('Filter') : null}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="no-data-cell">
                  <div className="no-data">
                    <span className="no-data-icon">📊</span>
                    <p>No data available</p>
                    <small>Try adjusting your filters or date range</small>
                  </div>
                </td>
              </tr>
            ) : (
              page.map((row, i) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="data-row">
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()} className="data-cell">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && pageCount > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Page {pageIndex + 1} of {pageOptions.length}
          </div>
          
          <div className="pagination-controls">
            <button 
              onClick={() => gotoPage(0)} 
              disabled={!canPreviousPage}
              className="pagination-btn"
              title="First Page"
            >
              {'⏮️'}
            </button>
            <button 
              onClick={() => previousPage()} 
              disabled={!canPreviousPage}
              className="pagination-btn"
              title="Previous Page"
            >
              {'⬅️'}
            </button>
            
            <div className="page-input">
              <input
                type="number"
                min="1"
                max={pageOptions.length}
                value={pageIndex + 1}
                onChange={e => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(page);
                }}
                className="page-number-input"
              />
            </div>
            
            <button 
              onClick={() => nextPage()} 
              disabled={!canNextPage}
              className="pagination-btn"
              title="Next Page"
            >
              {'➡️'}
            </button>
            <button 
              onClick={() => gotoPage(pageCount - 1)} 
              disabled={!canNextPage}
              className="pagination-btn"
              title="Last Page"
            >
              {'⏭️'}
            </button>
          </div>
          
          <div className="page-size-selector">
            <label>Show:</label>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
              }}
              className="page-size-select"
            >
              {[10, 20, 30, 50, 100].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
            <span>rows</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageTable;