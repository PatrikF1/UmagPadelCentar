import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import XLSX from 'xlsx'

const app = express()
app.use(cors())
app.use(express.json())

// Middleware za logiranje svih zahtjeva
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  console.log('Headers:', req.headers)
  next()
})

// MongoDB Atlas connection
const MONGODB_URI =
  'mongodb+srv://patrikfabijanic9:Monster12@padelcentarumag.ykgfkzx.mongodb.net/Padel?retryWrites=true&w=majority&appName=PadelCentarUmag'

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas')
    // Create initial admin only after successful connection
    createInitialAdmin()
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: true, // This ensures password isn't returned in queries
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other'],
  },
  padelExperience: {
    type: String,
    required: [true, 'Padel experience is required'],
    enum: ['beginner', 'intermediate', 'pro'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const User = mongoose.model('User', userSchema)

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

const Admin = mongoose.model('Admin', adminSchema)

// Middleware for verifying admin token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }
    const decoded = jwt.verify(token, 'your-secret-key')
    const admin = await Admin.findById(decoded.adminId)
    if (!admin) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    req.admin = admin
    next()
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Routes
app.post('/api/users', async (req, res) => {
  try {
    console.log('Received registration data:', { ...req.body, password: '***' })

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const userData = {
      name: req.body.name.trim(),
      email: req.body.email.toLowerCase().trim(),
      password: hashedPassword,
      birthDate: new Date(req.body.birthDate),
      gender: req.body.gender,
      padelExperience: req.body.padelExperience,
    }

    const user = new User(userData)
    await user.save()

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    console.log('Saved user:', { ...userResponse, password: '***' })
    res.status(201).json(userResponse)
  } catch (error) {
    console.error('Registration error:', error)
    res.status(400).json({ error: error.message })
  }
})

app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt')
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Greška prilikom dohvaćanja korisnika' })
  }
})

app.put('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.delete('/api/users/:id', verifyToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body
    console.log('Login attempt for:', username)

    const admin = await Admin.findOne({ username })
    if (!admin) {
      return res.status(401).json({ error: 'Pogrešni podaci za prijavu' })
    }

    const isValid = await bcrypt.compare(password, admin.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Pogrešni podaci za prijavu' })
    }

    const token = jwt.sign({ adminId: admin._id }, 'your-secret-key', { expiresIn: '24h' })

    console.log('Admin login successful:', username)
    res.json({ token })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Greška prilikom prijave' })
  }
})

app.get('/api/export', verifyToken, async (req, res) => {
  try {
    console.log('Starting export process...')
    const users = await User.find().lean()

    if (!users || users.length === 0) {
      console.log('No users found to export')
      return res.status(404).json({ error: 'No users found to export' })
    }

    console.log('Found users:', JSON.stringify(users, null, 2))

    // Create CSV header
    const csv = users.reduce((acc, user) => {
      console.log('\nProcessing user data:', user)

      // Ensure name is a string and split it
      const fullName = String(user.name || '')
      const nameParts = fullName.trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      console.log('Name parts:', { fullName, firstName, lastName })

      // Format gender
      let gender = ''
      if (user.gender === 'male') gender = 'Muško'
      else if (user.gender === 'female') gender = 'Žensko'
      else if (user.gender === 'other') gender = 'Ostalo'

      console.log('Formatted gender:', gender)

      // Format experience
      let experience = ''
      if (user.padelExperience === 'beginner') experience = 'Početnik'
      else if (user.padelExperience === 'intermediate') experience = 'Srednji'
      else if (user.padelExperience === 'pro') experience = 'Napredni'

      console.log('Formatted experience:', experience)

      // Format date
      let birthDate = ''
      if (user.birthDate) {
        try {
          birthDate = new Date(user.birthDate).toLocaleDateString('hr-HR')
        } catch (error) {
          console.error('Error formatting date:', error)
          birthDate = ''
        }
      }

      console.log('Formatted birth date:', birthDate)

      // Create CSV row with proper escaping
      const row = [firstName, lastName, user.email || '', birthDate, gender, experience]
        .map((field) => {
          // Properly escape fields that might contain commas or quotes
          const escaped = String(field).replace(/"/g, '""')
          return `"${escaped}"`
        })
        .join(',')

      console.log('Generated row:', row)

      return acc + row + '\n'
    }, 'Ime,Prezime,Email,Datum Rođenja,Spol,Padel Iskustvo\n')

    console.log('\nFinal CSV content:', csv)

    // Send response
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename=registrirani_korisnici.csv')
    res.send(csv)

    console.log('Export completed successfully')
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: error.message })
  }
})

// HTML Export route
app.get('/api/export-html', verifyToken, async (req, res) => {
  console.log('Export HTML route hit')
  try {
    console.log('Starting HTML export...')

    // Prvo provjeri ima li korisnika
    const count = await User.countDocuments()
    console.log(`Total users in database: ${count}`)

    if (count === 0) {
      console.log('No users found in database')
      return res.status(404).json({ error: 'Nema registriranih korisnika' })
    }

    // Dohvati sve korisnike
    const users = await User.find().sort('-createdAt').lean().exec()

    console.log(`Successfully fetched ${users.length} users`)

    if (!users?.length) {
      console.log('No users returned from query')
      return res.status(404).json({ error: 'Nema registriranih korisnika' })
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Registered Users - Padel Center Umag</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6; 
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 20px 0; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #f8f9fa; 
            font-weight: bold; 
          }
          tr:nth-child(even) { 
            background-color: #f8f9fa; 
          }
          tr:hover { 
            background-color: #f2f2f2; 
          }
          .export-info { 
            color: #666; 
            margin-bottom: 20px; 
          }
          .export-buttons {
            margin: 20px 0;
          }
          .export-btn {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-right: 10px;
          }
          .export-btn:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="export-info">
          <h1>Registered Users - Padel Center Umag</h1>
          <p>Exported: ${new Date().toLocaleString('en-US')}</p>
          <p>Total users: ${users.length}</p>
        </div>

        <div class="export-buttons">
          <button onclick="exportTableToCSV('registered_users.csv')" class="export-btn">
            Export to CSV
          </button>
        </div>
        
        <table id="usersTable">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Birth Date</th>
              <th>Gender</th>
              <th>Padel Experience</th>
            </tr>
          </thead>
          <tbody>
            ${users
              .map((user) => {
                const nameParts = (user.name || '').trim().split(/\s+/)
                const firstName = nameParts[0] || ''
                const lastName = nameParts.slice(1).join(' ') || ''

                const gender =
                  {
                    male: 'Male',
                    female: 'Female',
                    other: 'Other',
                  }[user.gender] || ''

                const experience =
                  {
                    beginner: 'Beginner',
                    intermediate: 'Intermediate',
                    pro: 'Professional',
                  }[user.padelExperience] || ''

                const birthDate = user.birthDate
                  ? new Date(user.birthDate).toLocaleDateString('en-US')
                  : ''

                return `
                <tr>
                  <td>${firstName}</td>
                  <td>${lastName}</td>
                  <td>${user.email}</td>
                  <td>${birthDate}</td>
                  <td>${gender}</td>
                  <td>${experience}</td>
                </tr>
              `
              })
              .join('')}
          </tbody>
        </table>

        <script>
          function exportTableToCSV(filename) {
            const table = document.getElementById('usersTable');
            const rows = table.querySelectorAll('tr');
            const csv = [];
            
            for (const row of rows) {
              const rowData = [];
              for (const cell of row.querySelectorAll('th, td')) {
                let text = cell.textContent;
                // Escape quotes and wrap in quotes if contains comma or quotes
                if (text.includes('"') || text.includes(',')) {
                  text = '"' + text.replace(/"/g, '""') + '"';
                }
                rowData.push(text);
              }
              csv.push(rowData.join(','));
            }

            const csvContent = csv.join('\\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            
            if (navigator.msSaveBlob) { // IE 10+
              navigator.msSaveBlob(blob, filename);
            } else {
              const link = document.createElement('a');
              if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }
          }

          // Automatically select table for easier copying
          window.onload = function() {
            try {
              const range = document.createRange();
              range.selectNode(document.querySelector('table'));
              window.getSelection().removeAllRanges();
              window.getSelection().addRange(range);
            } catch (error) {
              console.error('Error selecting table:', error);
            }
          };
        </script>
      </body>
      </html>
    `

    console.log('Sending HTML response...')
    res.setHeader('Content-Type', 'text/html')
    res.send(html)

    console.log('Export completed successfully')
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: 'Error exporting data' })
  }
})

// Get user by email
app.get('/api/users/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Add login route
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Compare passwords
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.json(userResponse)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Create initial admin user
async function createInitialAdmin() {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' })

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('PadelCentarUmag1', 10)
      const admin = await Admin.create({
        username: 'admin',
        password: hashedPassword,
      })
      console.log('Admin account created:', admin.username)
    } else {
      console.log('Admin account already exists')
    }
  } catch (error) {
    console.error('Error creating admin:', error)
  }
}

const PORT = process.env.PORT || 3000

// Only start the server if we have a database connection
mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})
