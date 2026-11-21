import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import App from './App'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

// A tiny fake API: each test says what GET /api/todos returns.
function fakeApi(handlers) {
  const fetchMock = vi.fn(async (url, options = {}) => {
    const key = `${options.method || 'GET'} ${url}`
    const handler = handlers[key]
    if (!handler) throw new Error(`unexpected request: ${key}`)
    const { status = 200, body } = handler(options)
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

test('renders without crashing', () => {
  vi.stubGlobal('fetch', () => new Promise(() => {})) // never answers, so tests need no network
  const { container } = render(<App />)
  expect(container.firstChild).not.toBeNull()
})

test('shows the todos from the API', async () => {
  fakeApi({
    'GET /api/todos': () => ({
      body: [
        { id: 1, title: 'Learn nginx', done: false },
        { id: 2, title: 'Deploy Flask', done: true },
      ],
    }),
  })
  render(<App />)
  expect(await screen.findByText('Learn nginx')).toBeTruthy()
  expect(screen.getByText('Deploy Flask')).toBeTruthy()
  expect(screen.getByText('1 task left')).toBeTruthy()
})

test('adds a todo and clears the input', async () => {
  const fetchMock = fakeApi({
    'GET /api/todos': () => ({ body: [] }),
    'POST /api/todos': (options) => ({
      status: 201,
      body: { id: 7, title: JSON.parse(options.body).title, done: false },
    }),
  })
  render(<App />)
  await screen.findByText(/Nothing to do/)

  const input = screen.getByLabelText('New todo')
  fireEvent.change(input, { target: { value: 'Write tests' } })
  fireEvent.click(screen.getByText('Add'))

  expect(await screen.findByText('Write tests')).toBeTruthy()
  expect(input.value).toBe('')
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/todos',
    expect.objectContaining({ method: 'POST' }),
  )
})

test('shows the API error message when something fails', async () => {
  fakeApi({
    'GET /api/todos': () => ({ status: 500, body: { error: 'internal server error' } }),
  })
  render(<App />)
  expect((await screen.findByRole('alert')).textContent).toBe('internal server error')
})
