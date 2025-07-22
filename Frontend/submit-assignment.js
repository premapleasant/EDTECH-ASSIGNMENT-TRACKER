const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'student') {
  alert('Access denied');
  window.location.href = 'auth.html';
}

// Load assignments for student to select
async function loadAssignments() {
  const res = await fetch('http://localhost:3000/api/assignments', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const assignments = await res.json();

  const select = document.getElementById('assignmentSelect');
  assignments.forEach(assign => {
    const option = document.createElement('option');
    option.value = assign.id;
    option.textContent = `${assign.title} (Due: ${assign.due_date})`;
    select.appendChild(option);
  });
}

loadAssignments();

document.getElementById('submitForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const assignmentId = document.getElementById('assignmentSelect').value;
  const content = document.getElementById('content').value;

  const res = await fetch(`http://localhost:3000/api/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) {
    document.getElementById('submitForm').reset();
  }
});

function logout() {
  localStorage.clear();
  window.location.href = 'auth.html';
}
