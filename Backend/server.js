const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET; 


const db = mysql.createConnection({
  host: process.env.DATABASE_HOST ,
  user: process.env.DATABASE_USER ,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});


function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid token' });
  }
}

function isTeacher(req, res, next) {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Teacher only' });
  next();
}

function isStudent(req, res, next) {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Student only' });
  next();
}


//register
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already exists' });
        return res.status(500).json({ message: 'Error registering user' });
      }
      res.json({ message: 'Registered successfully' });
    });
});


//login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
    res.json({ message: 'Login success', token, role: user.role });
  });
});


// Get all assignments (for students & teachers)
app.get('/api/assignments', verifyToken, (req, res) => {
  const user = req.user;
  let query = 'SELECT * FROM assignments';
  if (user.role === 'teacher') {
    query += ' WHERE teacher_id = ?';
  }

  db.query(query, user.role === 'teacher' ? [user.id] : [], (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to load assignments' });
    res.json(results);
  });
});

// Create assignment (teacher only)
app.post('/api/assignments', verifyToken, isTeacher, (req, res) => {
  const { title, description, dueDate } = req.body;
  const teacher_id = req.user.id;

  db.query(
    'INSERT INTO assignments (title, description, due_date, teacher_id) VALUES (?, ?, ?, ?)',
    [title, description, dueDate, teacher_id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed to create assignment' });
      res.json({ message: 'Assignment created' });
    }
  );
});


// Submit assignment (student only)
app.post('/api/assignments/:id/submit', verifyToken, isStudent, (req, res) => {
  const assignment_id = req.params.id;
  const student_id = req.user.id;
  const { content } = req.body;

  db.query(
    'INSERT INTO submissions (assignment_id, student_id, content) VALUES (?, ?, ?)',
    [assignment_id, student_id, content],
    (err) => {
      if (err) return res.status(500).json({ message: 'Submission failed' });
      res.json({ message: 'Assignment submitted' });
    }
  );
});


//  View submissions (teacher only)
app.get('/api/assignments/:id/submissions', verifyToken, isTeacher, (req, res) => {
  const assignment_id = req.params.id;

  const query = `
    SELECT u.name AS student_name, s.content, s.submitted_at
    FROM submissions s
    JOIN users u ON s.student_id = u.id
    WHERE s.assignment_id = ?
  `;

  db.query(query, [assignment_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to load submissions' });
    res.json(results);
  });
});

const PORT = process.env.PORT || 3000;
// server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
