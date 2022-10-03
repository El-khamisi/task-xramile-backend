const bcrypt = require('bcrypt');
const User = require('./user.model');
const { successfulRes, failedRes } = require('../../utils/response');
const { Instructor, Admin, Student } = require('../../config/roles');
const { categories } = require('../../config/public_config');

exports.getUsers = async (req, res) => {
  let matchQuery = { is_deleted: false };
  let { role, page = 1, limit = 16 } = req.query;

  if (role && role != Instructor && role != Admin && role != Student) return failedRes(res, 400, new Error(`${role} is NOT allowed role`));
  if (role) matchQuery.role = role;

  try {
    const response = await User.aggregate([
      {
        $match: matchQuery,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          first_name: 1,
          last_name: 1,
          email: 1,
          phone: 1,
          is_verified: 1,
          role: 1,
          photo: 1,
          description: 1,
          specialist: 1,
          rating: {
            $cond: [
              { $eq: [role, Instructor] },
              {
                total_users: '$rating.total_users',
                avg_rate: {
                  $cond: [{ $gt: ['$rating.total_users', 0] }, { $divide: ['$rating.total_rate', '$rating.total_users'] }, 0],
                },
              },
              0,
            ],
          },
        },
      },
    ]);
    return successfulRes(res, 200, response);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.getInstructors = async (req, res) => {
  const { limit = 20 } = req.body;
  try {
    let response = await User.find({ is_deleted: false, role: Instructor })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('first_name last_name email is_verified photo description specialist rating');
    if (!response) return failedRes(res, 404, new Error(`Can NOT Find instructors`));

    response = response.map((e) => {
      e = e.toObject();
      e.rating = {
        total_users: e.rating?.total_users,
        avg_rate: e.rating?.total_users > 0 ? e.rating?.total_rate / e.rating?.total_users : 0,
      };
      return e;
    });

    return successfulRes(res, 200, response);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.getUser = async (req, res) => {
  try {
    const _id = req.params.id;

    const response = await User.findById(_id).exec();
    response.password = undefined;

    return successfulRes(res, 200, response);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.addUser = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, role, photo, specialist, description } = req.body;

    if (!Array.isArray(specialist) || !specialist.every((e) => Object.values(categories).includes(e)))
      return failedRes(res, 400, new Error(`can NOT process specialist [it must be array and one of values ${Object.values(categories)}]`));

    const saved = new User({
      first_name,
      last_name,
      email,
      phone,
      password: password === undefined ? '1234' : password,
      role,
      photo,
      description,
      specialist: role == Instructor || role == Admin ? specialist : [],
    });
    if (password) {
      saved.password = bcrypt.hashSync(password, 10);
    } else {
      throw new Error('Invalid Password');
    }

    await saved.save();

    return successfulRes(res, 201, saved);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const _id = req.params.id;
    const { first_name, last_name, photo, role, specialist, description } = req.body;

    let doc = await User.findById(_id);
    if (!doc) return failedRes(res, 400, new Error(`can NOT find user with #ID ${_id}`));

    if (!Array.isArray(specialist) || !specialist.every((e) => Object.values(categories).includes(e)))
      return failedRes(res, 400, new Error(`can NOT process specialist [it must be array and one of values ${Object.values(categories)}]`));

    doc.first_name = first_name ? first_name : doc.first_name;
    doc.last_name = last_name ? last_name : doc.last_name;
    doc.photo = photo ? photo : doc.photo;
    doc.role = role ? role : doc.role;
    doc.description = description ? description : doc.description;

    if (role == Instructor || role == Admin) {
      doc.specialist = specialist ? specialist : doc.specialist;
    }

    valid = doc.validateSync();
    if (valid) throw valid;
    await doc.save();
    doc.password = undefined;
    return successfulRes(res, 200, doc);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const _id = req.params.id;
    const force = req.query.force;

    let response;
    if (force == 'true') {
      const doc = await User.findByIdAndDelete(_id).exec();
      response = `User[${doc.first_name} ${doc.last_name}] has been deleted successfully with --FORCE Option`;
    } else {
      const doc = await User.findByIdAndUpdate(_id, { is_deleted: true }).exec();
      response = `User[${doc.title}] has been deleted successfully --SOFTLY`;
    }

    return successfulRes(res, 200, response);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};
