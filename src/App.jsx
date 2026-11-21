import { useEffect, useState } from 'react'
import { createTodo, deleteTodo, listTodos, setDone } from './api'

export default function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')

  useEffect(() => {
    let cancelled = false
    listTodos()
      .then((data) => {
        if (!cancelled) setTodos(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Run an API call, show its error if it fails, and report whether it worked.
  async function attempt(action) {
    setError('')
    try {
      await action()
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  async function handleAdd(event) {
    event.preventDefault()
    const text = title.trim()
    if (!text) return
    await attempt(async () => {
      const created = await createTodo(text)
      setTodos((current) => [...current, created])
      setTitle('')
    })
  }

  async function handleToggle(todo) {
    await attempt(async () => {
      const updated = await setDone(todo.id, !todo.done)
      setTodos((current) => current.map((t) => (t.id === updated.id ? updated : t)))
    })
  }

  async function handleDelete(todo) {
    await attempt(async () => {
      await deleteTodo(todo.id)
      setTodos((current) => current.filter((t) => t.id !== todo.id))
    })
  }

  const remaining = todos.filter((t) => !t.done).length

  return (
    <main className="app">
      <h1>
        To-do<span>.</span>
      </h1>
      <p className="subtitle">Flask API, PostgreSQL, nginx, and a push to deploy.</p>

      <form className="add" onSubmit={handleAdd}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs doing?"
          aria-label="New todo"
          maxLength={200}
        />
        <button type="submit">Add</button>
      </form>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : todos.length === 0 ? (
        <p className="muted">Nothing to do. Add your first task above.</p>
      ) : (
        <ul className="list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.done ? 'done' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => handleToggle(todo)}
                />
                <span>{todo.title}</span>
              </label>
              <button
                type="button"
                className="delete"
                onClick={() => handleDelete(todo)}
                aria-label={`Delete ${todo.title}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && todos.length > 0 && (
        <p className="muted">
          {remaining} {remaining === 1 ? 'task' : 'tasks'} left
        </p>
      )}
    </main>
  )
}
