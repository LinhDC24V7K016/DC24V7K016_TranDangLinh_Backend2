const { ObjectId } = require("mongodb");

class ContactService {
  constructor(client) {
    this.Contact = client.db().collection("contacts");
  }

  extractContactData(payload) {
    let group = payload.group;
    if (group && !Array.isArray(group)) {
      group = [group];
    }

    const contact = {
      name: payload.name,
      email: payload.email,
      address: payload.address,
      phone: payload.phone,
      favorite: payload.favorite === "true" || payload.favorite === true,
      group: group,
      avatar: payload.avatar,
      userId: payload.userId,
    };

    Object.keys(contact).forEach(
      (key) => contact[key] === undefined && delete contact[key],
    );
    return contact;
  }

  async create(payload) {
    const contact = this.extractContactData(payload);
    const result = await this.Contact.findOneAndUpdate(
      contact,
      { $set: { favorite: contact.favorite === true } },
      { returnDocument: "after", upsert: true },
    );
    return result;
  }

  async find(filter) {
    const cursor = await this.Contact.find(filter);
    return await cursor.toArray();
  }

  async findByName(userId, name) {
    return await this.find({
      userId: userId,
      name: { $regex: new RegExp(new RegExp(name)), $options: "i" },
    });
  }

  async findById(userId, id) {
    return await this.Contact.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
      userId: userId,
    });
  }

  async update(userId, id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
      userId: userId,
    };
    const update = this.extractContactData(payload);
    const result = await this.Contact.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" },
    );
    return result;
  }

  async delete(userId, id) {
    const result = await this.Contact.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
      userId: userId,
    });
    return result;
  }

  async findFavorite(userId) {
    return await this.find({ userId: userId, favorite: true });
  }

  async deleteAll(userId) {
    const result = await this.Contact.deleteMany({ userId: userId });
    return result.deletedCount;
  }
}

module.exports = ContactService;
