const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'teacher') {
  alert('Access denied');
  window.location.href = 'auth.html';
}

// Load teacher's assignments
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

document.getElementById('assignmentSelect').addEventListener('change', async (e) => {
  const assignmentId = e.target.value;
  const tableBody = document.querySelector('#submissionsTable tbody');
  tableBody.innerHTML = '';

  if (!assignmentId) return;

  const res = await fetch(`http://localhost:3000/api/assignments/${assignmentId}/submissions`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const submissions = await res.json();

  if (submissions.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="3">No submissions yet</td>`;
    tableBody.appendChild(row);
    return;
  }

  submissions.forEach(sub => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${sub.student_name}</td>
      <td>${sub.content}</td>
      <td>${new Date(sub.submitted_at).toLocaleString()}</td>
    `;
    tableBody.appendChild(row);
  });
});

function logout() {
  localStorage.clear();
  window.location.href = 'auth.html';
}
