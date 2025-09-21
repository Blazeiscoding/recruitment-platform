const pool = require("../utils/database");
const bcrypt = require("bcrypt");

class User {
  static async create(userData) {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      location,
      bio,
      skills,
      experienceLevel,
      salaryExpectation,
    } = userData;

    const passwordHash = await bcrypt.hash(password, 12);

    const query = `
            INSERT INTO users (email, password_hash, first_name, last_name, phone, location, bio, skills, experience_level, salary_expectation)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, email, first_name, last_name, phone, location, bio, skills, experience_level, salary_expectation, created_at
        `;

    const values = [
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      location,
      bio,
      skills,
      experienceLevel,
      salaryExpectation,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === "23505") {
        // Unique violation
        throw new Error("Email already exists");
      }
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1 AND is_active = true";
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
            SELECT id, email, first_name, last_name, phone, location, bio, skills, 
                   experience_level, salary_expectation, created_at, updated_at, last_login
            FROM users 
            WHERE id = $1 AND is_active = true
        `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateLastLogin(id) {
    const query =
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1";
    await pool.query(query, [id]);
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProfile(id, updateData) {
    const allowedFields = [
      "first_name",
      "last_name",
      "phone",
      "location",
      "bio",
      "skills",
      "experience_level",
      "salary_expectation",
    ];
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id);
    const query = `
            UPDATE users 
            SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount} AND is_active = true
            RETURNING id, email, first_name, last_name, phone, location, bio, skills, experience_level, salary_expectation, updated_at
        `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = User;
