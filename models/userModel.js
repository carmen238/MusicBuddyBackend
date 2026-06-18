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
  bio,
  instrument = "",
  experienceLevel = "",
  genre = "",
  isInBand = false,
  photo_url
) {
  try {
    const result = await dbAsync.run(
      `INSERT INTO users 
      (email, password, name, surname, phone, bio, instrument, experienceLevel, genre, isInBand, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
 * DELETE USER
 */
async function deleteUser(id) {
  try {
    const user = await findUserById(id);
    if (!user) {
      console.log(`❌ User not found: ${id}`);
      return false;
    }
    else {
      await dbAsync.run(`DELETE FROM users WHERE id = ?`, [id]);
      console.log(`✅ User deleted: ${id}`);
      return true;
    }
  } catch (err) {
    console.error('❌ Error deleting user:', err.message);
    throw err;
  }

}

/**
 * GET ALL USERS INFOS
 */
async function getAllUsersInfos() {
  try {
    const query = 'SELECT id, instrument, experienceLevel, genre, isInBand FROM users';
    return await dbAsync.all(query);
  } catch (err) { 
    console.error('❌ Error finding some users:', err.message);
    throw err;
  }
}

/**
 * GET GENRES STATISTICS
 */
async function getGenresStats() {
  try {
    const query = 'SELECT genre, COUNT(*) AS total FROM users GROUP BY genre ORDER BY total DESC';
    return await dbAsync.all(query);
  } catch (err) { 
    console.error('❌ Error in counting genres:', err.message);
    throw err;
  }
}

/**
 * GET INSTRUMENTS STATISTICS
 */
async function getInstrumentsStats() {
  try {
    const query = 'SELECT instrument, COUNT(*) AS total FROM users GROUP BY instrument ORDER BY total DESC';
    return await dbAsync.all(query);
  } catch (err) { 
    console.error('❌ Error in counting instruments:', err.message);
    throw err;
  }
}

/**
 * GET TOTAL NUMBER OF USERS
 */
async function getTotNumUsers() {
  try {
    const query = 'SELECT COUNT(*) as tot_users FROM users';
    return await dbAsync.all(query);
  } catch (err) { 
    console.error('❌ Error in counting instruments:', err.message);
    throw err;
  }
}

/**
 * UPDATE USER LOCATION
 */
async function postUserLocation(idUser, latitude, longitude) {
  try {
    // Verifica che l'utente esista
    const user = await findUserById(idUser);
    if (!user) {
      console.log(`❌ User not found: ${idUser}`);
      return false;
    }

    // Esegui l'update
    await dbAsync.run(
      `UPDATE users SET latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [latitude, longitude, idUser]  // ✅ CORRETTO: idUser al posto di id
    );
    
    return true;

  } catch (err) {
    console.error(`❌ Error updating user location: ${err.message}`);
    return false;
  }
}

/**
 * GET USER LOCATION FROM DATABASE (NON SERVE, TANTO LA PRENDE DALL'API DI GOOGLE MAPS)
 */
async function getUserLocation(idUser, keyField, valueField) {
  //...
}

/**
 * FETCH NEARBY MUSICIANS INFO
 */
async function getNearbyMusicians(userId, userLat, userLong, range) {
  try {
    const radius = range/2;
    const latDelta = radius/111.0;
    const latInRadians = (userLat * Math.PI) / 180;
    // 1 grado di longitudine dipende dalla latitudine attuale
    const kmPerDegreeLong = 111.32 * Math.cos(latInRadians);
    const longDelta = radius / kmPerDegreeLong;
    const query = 'SELECT id, name, surname, instrument, experienceLevel, genre, isInBand, photo_url, latitude, longitude FROM users WHERE ABS(? - latitude) < ? AND ABS(? - longitude) < ? AND id != ?';
    return await dbAsync.all(query, [userLat, latDelta, userLong, longDelta, userId]);
  } catch (err) { 
    console.error('❌ Error in fetching nearby musicians:', err.message);
    throw err;
  }
}

async function sendFriendRequest(senderId, receiverId) {
  try {
    const result = await dbAsync.run(
      `INSERT INTO friendships (sender_id, receiver_id, status) VALUES (?, ?, ?)`,
      [senderId, receiverId, "PENDING"]
    );

    console.log(`✅ Friend request sent to user ${receiverId}`);
    return true;

  } catch (err) {
    console.error('❌ Error sending friend request:', err.message);
    return false;
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  getAllUsersInfos,
  getGenresStats,
  getInstrumentsStats,
  getTotNumUsers,
  postUserLocation,
  getUserLocation,
  getNearbyMusicians,
  sendFriendRequest
};