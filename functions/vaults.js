exports.handler = async (event) => {
  const { httpMethod, path } = event;
  
  if (httpMethod === 'GET') {
    try {
      const response = await fetch('https://raw.githubusercontent.com/etoolfun/flapvault/main/vault.json');
      const data = await response.json();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
  }
  
  if (httpMethod === 'PUT') {
    const { content, sha } = JSON.parse(event.body);
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'GitHub Token not configured' })
      };
    }
    
    try {
      const response = await fetch(
        'https://api.github.com/repos/etoolfun/flapvault/contents/vault.json',
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: 'Update vault data via admin panel',
            content,
            sha,
            branch: 'main'
          })
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, message: 'GitHub file updated' })
        };
      } else {
        const error = await response.json();
        return {
          statusCode: response.status,
          body: JSON.stringify({ success: false, message: error.message })
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: error.message })
      };
    }
  }
  
  if (httpMethod === 'GET' && path.includes('/sha')) {
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'GitHub Token not configured' })
      };
    }
    
    try {
      const response = await fetch(
        'https://api.github.com/repos/etoolfun/flapvault/contents/vault.json?ref=main',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          statusCode: 200,
          body: JSON.stringify({ sha: data.sha })
        };
      } else if (response.status === 404) {
        return {
          statusCode: 200,
          body: JSON.stringify({ sha: '' })
        };
      } else {
        const error = await response.json();
        return {
          statusCode: response.status,
          body: JSON.stringify({ error: error.message })
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
  }
  
  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not found' })
  };
};
