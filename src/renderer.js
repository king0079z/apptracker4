const fetchUsageStats = async () => {
  const stats = await window.api.fetchUsageStats();
  const statsBody = document.getElementById('stats-body');
  statsBody.innerHTML = stats.map(stat => `
    <tr>
      <td>${stat.app}</td>
      <td>${stat.total_hours ? stat.total_hours.toFixed(2) : 'N/A'}</td>
      <td>${stat.usage_count}</td>
      <td>${stat.computerName}</td>
      <td>${stat.ipAddress}</td>
    </tr>
  `).join('');
};

document.addEventListener('DOMContentLoaded', fetchUsageStats);
