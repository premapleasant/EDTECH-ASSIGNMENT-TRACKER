const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'teacher') {
  alert('Access denied');
  window.location.href = 'auth.html';
}

document.getElementById('assignmentForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const dueDate = document.getElementById('dueDate').value;

  const res = await fetch('http://localhost:3000/api/assignments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, dueDate })
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) {
    document.getElementById('assignmentForm').reset();
  }
});

function logout() {
  localStorage.clear();
  window.location.href = 'auth.html';
}
