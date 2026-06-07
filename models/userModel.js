const dbAsync = require('../database/db');

/**
 * CREATE USER
 */
async function createUser(
  email,
  hashedPassword,
  name,
  surname,
  phone,
  bio = "",
  instrument = "",
  experienceLevel = "",
  genre = "",
  isInBand = false,
  photo_url = null
) {
  try {
    const result = await dbAsync.run(
      `INSERT INTO users 
      (email, password, name, surname, phone, bio, instrument, experienceLevel, genre, isInBand, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        hashedPassword,
        name,
        surname,
        phone,
        bio,
        instrument,
        experienceLevel,
        genre,
        isInBand ? 1 : 0,
        photo_url
      ]
    );

    console.log(`✅ User created: ${email} (ID: ${result.id})`);
    return result.id;

  } catch (err) {
    console.log(`ciaoooo`);
    console.error('❌ Error creating user:', err.message);
    throw err;
  }
}

/**
 * FIND BY EMAIL
 */
async function findUserByEmail(email) {
  try {
    const user = await dbAsync.get(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (user) {
      user.isInBand = user.isInBand === 1;
    }

    return user;

  } catch (err) {
    console.error('❌ Error finding user by email:', err.message);
    throw err;
  }
}

/**
 * FIND BY ID
 */
async function findUserById(id) {
  try {
    const user = await dbAsync.get(
      `SELECT id, email, name, surname, phone, bio, instrument, experienceLevel, genre, isInBand, created_at FROM users WHERE id = ?`,
      [id]
    );

    if (user) {
      user.isInBand = user.isInBand === 1;
    }

    return user;

  } catch (err) {
    console.error('❌ Error finding user by ID:', err.message);
    throw err;
  }
}

/**
 * UPDATE USER FIELD
 */
async function updateUser(idUser, keyField, valueField) {
  try {
    // Campi consentiti
    const allowed = [
  'email',
  'name',
  'surname',
  'phone',
  'bio',
  'instrument',
  'genre',
  'experienceLevel',
  'isInBand',
  'photo_url' 
];

    if (!allowed.includes(keyField)) {
      console.log(`❌ Field not allowed: ${keyField}`);
      return false;
    }

    // Verifica che l'utente esista
    const user = await findUserById(idUser);
    if (!user) {
      console.log(`❌ User not found: ${idUser}`);
      return false;
    }

    // Converti il valore se necessario
    let value = valueField;
    if (keyField === 'isInBand') {
      value = valueField === 'true' || valueField === true ? 1 : 0;
    }

    console.log(`📝 Updating user ${idUser}: ${keyField} = ${value}`);

    // Esegui l'update
    await dbAsync.run(
      `UPDATE users SET ${keyField} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [value, idUser]  // ✅ CORRETTO: idUser al posto di id
    );

    console.log(`✅ User field updated: ${keyField}`);
    return true;

  } catch (err) {
    console.error(`❌ Error updating user field: ${err.message}`);
    return false;
  }
}


/**
 * GET ALL USERS
 */
async function getAllUsersInfos() {
  try {
    // .all() per avere un array di righe
    const users = await dbAsync.all(
      `SELECT * FROM users;`,
    );

    if (users && users.length > 0) {
      return users; 
    } else {
      return [];
    }

  } catch (err) { 
    console.error('❌ Error finding some users:', err.message);
    throw err;
  }
}

/**
 * DELETE USER
 */
async function deleteUser(id) {
  try {
    await dbAsync.run(`DELETE FROM users WHERE id = ?`, [id]);
    console.log(`✅ User deleted: ${id}`);
    return true;

  } catch (err) {
    console.error('❌ Error deleting user:', err.message);
    throw err;
  }
}

/**
 * GET ALL USERS INFOS
 */
async function getAllUsersInfos() {
    const query = 'SELECT id, instrument, experienceLevel, genre, isInBand, rating FROM users';
    return await dbAsync.all(query);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  getAllUsersInfos
};