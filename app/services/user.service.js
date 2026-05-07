const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

class UserService {
  constructor(client) {
    this.User = client.db().collection("users");
  }

  async create(payload) {
    const user = {
      email: payload.email,
      name: payload.name,
      password: payload.password ? await bcrypt.hash(payload.password, 10) : null,
      googleId: payload.googleId || null,
    };

    const result = await this.User.findOneAndUpdate(
      { email: user.email },
      { $setOnInsert: user },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  async findOrCreateGoogleUser(profile) {
    let user = await this.findByEmail(profile.email);
    if (!user) {
      user = await this.create({
        email: profile.email,
        name: profile.name,
        password: null,
        googleId: profile.sub,
      });
    } else if (!user.googleId) {
      user = await this.User.findOneAndUpdate(
        { email: profile.email },
        { $set: { googleId: profile.sub } },
        { returnDocument: "after" }
      );
    }
    return user;
  }

  async findByEmail(email) {
    return await this.User.findOne({ email: email });
  }

  async findById(id) {
    return await this.User.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }
}

module.exports = UserService;
