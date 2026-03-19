/**
 * Script to create sample users with @unbc.ca emails
 * Run with: node scripts/createSampleUsers.js
 */

const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const users = [
  {
    id: Date.now().toString(),
    email: 'student@unbc.ca',
    name: 'UNBC Student',
    phone: '+1 (250) 555-0100',
    avatar: 'https://picsum.photos/400/400?random=1',
    password: 'test123',
    createdAt: new Date().toISOString()
  },
  {
    id: (Date.now() + 1).toString(),
    email: 'john.doe@unbc.ca',
    name: 'John Doe',
    phone: '+1 (250) 555-0101',
    avatar: 'https://picsum.photos/400/400?random=2',
    password: 'test123',
    createdAt: new Date().toISOString()
  },
  {
    id: (Date.now() + 2).toString(),
    email: 'jane.smith@unbc.ca',
    name: 'Jane Smith',
    phone: '+1 (250) 555-0102',
    avatar: 'https://picsum.photos/400/400?random=3',
    password: 'test123',
    createdAt: new Date().toISOString()
  }
];

async function createUsers() {
  try {
    // Hash all passwords
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          password: hashedPassword,
          createdAt: user.createdAt
        };
      })
    );

    // Write to file
    const filePath = path.join(__dirname, '../db/user.json');
    await fs.writeFile(filePath, JSON.stringify(hashedUsers, null, 2), 'utf8');

    console.log('✅ Sample users created successfully!');
    console.log('\n📋 User Credentials:');
    console.log('All users have password: test123\n');
    hashedUsers.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`ID: ${user.id}\n`);
    });

    // Verify one password
    const testPassword = 'test123';
    const testHash = hashedUsers[0].password;
    const isValid = await bcrypt.compare(testPassword, testHash);
    console.log(`✅ Password verification test: ${isValid ? 'PASSED' : 'FAILED'}`);
  } catch (error) {
    console.error('❌ Error creating users:', error);
  }
}

createUsers();
