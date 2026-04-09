const BASE_URL = 'http://127.0.0.1:8000';

async function jsonFetch(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  return response.json();
}

export async function reset() {
  return jsonFetch('/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

export async function step(action) {
  return jsonFetch('/step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
}

export async function getState() {
  return jsonFetch('/state');
}

export async function getTasks() {
  return jsonFetch('/tasks');
}

export async function gradeTask(task) {
  return jsonFetch('/grader', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: task, task }),
  });
}

export async function getBaseline() {
  return jsonFetch('/baseline');
}

export async function getAvailableActions(location) {
  const query = location ? `?location=${encodeURIComponent(location)}` : '';
  return jsonFetch(`/available-actions${query}`);
}
