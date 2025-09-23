async fetchDataFromAPI(token, adminToken) {
  if (this.config.testMode) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          userType: adminToken ? 'admin' : 'student',
          data: {
            students: this.fallbackData.students,
            tasks: this.fallbackData.tasks,
            awards: this.fallbackData.awards,
            compositions: []
          }
        });
      }, 1500);
    });
  }

  // Skutečné API volání
  const url = new URL(this.config.apiBaseUrl);
  url.searchParams.set('format', 'json');
  if (adminToken) {
    url.searchParams.set('admin', adminToken);
  } else if (token) {
    url.searchParams.set('token', token);
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
