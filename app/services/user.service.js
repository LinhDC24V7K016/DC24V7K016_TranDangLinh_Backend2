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
      password: await bcrypt.hash(payload.password, 10),
    };

    const result = await this.User.findOneAndUpdate(
      { email: user.email },
      { $setOnInsert: user },
      { returnDocument: "after", upsert: true }
    );
    return result;
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
