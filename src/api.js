// Every call uses a relative address (/api/...), never http://localhost:8000.
// In dev, Vite's proxy forwards it; in production, nginx does.
async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (body.error) message = body.error
    } catch {
      // the body was not JSON; keep the generic message
    }
    throw new Error(message)
  }

  return response.status === 204 ? null : response.json()
}

export const listTodos = () => request('/api/todos')

export const createTodo = (title) =>
  request('/api/todos', { method: 'POST', body: JSON.stringify({ title }) })

export const setDone = (id, done) =>
  request(`/api/todos/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) })

export const deleteTodo = (id) => request(`/api/todos/${id}`, { method: 'DELETE' })
