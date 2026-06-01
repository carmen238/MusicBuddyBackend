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
  instrument,
  genres,
  experienceLevel,
  isInBand
) {
  const result = await dbAsync.run(
    `INSERT INTO users 
    (email, password, name, surname, phone, instrument, genres, experienceLevel, isInBand)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      email,
      hashedPassword,
      name,
      surname,
      phone,
      JSON.stringify(instrument || []),
      JSON.stringify(genres || []),
      experienceLevel,
      isInBand ? 1 : 0
    ]
  );

  return result.id;
}

/**
 * FIND BY EMAIL
 */
async function findUserByEmail(email) {
  const user = await dbAsync.get(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );

  if (user) {
    user.instrument = JSON.parse(user.instrument || "[]");
    user.genres = JSON.parse(user.genres || "[]");
    user.isInBand = user.isInBand === 1;
  }

  return user;
}

/**
 * FIND BY ID
 */
async function findUserById(id) {
  const user = await dbAsync.get(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  );

  if (user) {
    user.instrument = JSON.parse(user.instrument || "[]");
    user.genres = JSON.parse(user.genres || "[]");
    user.isInBand = user.isInBand === 1;
  }

  return user;
}

/**
 * UPDATE FIELD (SAFE)
 */
async function updateFieldUser(id, keyField, valueField) {
  const allowed = [
    'email',
    'name',
    'surname',
    'phone',
    'bio',
    'instrument',
    'genres',
    'experienceLevel',
    'isInBand'
  ];

  if (!allowed.includes(keyField)) return false;

  const user = await findUserById(id);
  if (!user) return false;

  const value =
    Array.isArray(valueField)
      ? JSON.stringify(valueField)
      : keyField === 'isInBand'
      ? valueField ? 1 : 0
      : valueField;

  await dbAsync.run(
    `UPDATE users SET ${keyField} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [value, id]
  );

  return true;
}

/**
 * DELETE USER
 */
async function deleteUser(id) {
  await dbAsync.run(`DELETE FROM users WHERE id = ?`, [id]);
  return true;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateFieldUser,
  deleteUser
};