const dbAsync = require('../database/db');

/**
 * Create a new user in the database
 */
async function createUser(email, hashedPassword, name, surname, phone) {
  try {
    const result = await dbAsync.run(
      `INSERT INTO users (email, password, name, surname, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, name, surname, phone]
    );
    console.log(`✅ User created: ${email} (ID: ${result.id})`);
    return result.id;
  } catch (err) {
    console.error('❌ Error creating user:', err.message);
    throw err;
  }
}

/**
 * Find user by email
 */
async function findUserByEmail(email) {
  try {
    const user = await dbAsync.get(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return user;
  } catch (err) {
    console.error('❌ Error finding user:', err.message);
    throw err;
  }
}

/**
 * Find user by ID
 */
async function findUserById(id) {
  try {
    const user = await dbAsync.get(
      `SELECT id, email, name, surname, phone, bio, rating, created_at FROM users WHERE id = ?`,
      [id]
    );
    return user;
  } catch (err) {
    console.error('❌ Error finding user by ID:', err.message);
    throw err;
  }
}

/**
 * Update user profile
 */
async function updateUser(id, updates) {
  try {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await dbAsync.run(sql, values);
    console.log(`✅ User updated: ID ${id}`);
    return true;
  } catch (err) {
    console.error('❌ Error updating user:', err.message);
    throw err;
  }
}

/**
 * Delete user
 */
async function deleteUser(id) {
  try {
    await dbAsync.run(
      `DELETE FROM users WHERE id = ?`,
      [id]
    );
    console.log(`✅ User deleted: ID ${id}`);
    return true;
  } catch (err) {
    console.error('❌ Error deleting user:', err.message);
    throw err;
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser
};