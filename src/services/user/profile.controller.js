const User = require('./user.model');
const { successfulRes, failedRes } = require('../../utils/response');
const Course = require('../course/course.model');
const Spec = require('../spec/spec.model');

exports.profileView = async (req, res) => {
  try {
    const user = req.session.user;
    let response = { ...user };

    response.completed = [];
    response.inprogress = [];
    response.purchase = [];

    for (const course of response.courses) {
      const originalCourse = await Course.findById(course.course_id).exec();
      const nObj = {
        _id: originalCourse._id,
        title: originalCourse.title,
        thumb: originalCourse.thumb,
        instructor: originalCourse.instructor,
        description: originalCourse.description.text,
        category: originalCourse.category,
        type: 'course',
      };
      if (course.is_completed) {
        nObj.progress = `${originalCourse.lessons.length}`;
        nObj.progress += `/${nObj.progress}`;
        nObj.progress_bar = 100;

        response.completed.push(nObj);
      } else {
        nObj.progress = `${course.lessons.length}/${originalCourse.lessons.length}`;
        nObj.progress_bar = originalCourse.lessons.length <= 0 ? 0 : Math.round(course.lessons.length / originalCourse.lessons.length);

        response.inprogress.push(nObj);
      }
      response.purchase.push({
        _id: originalCourse._id,
        title: originalCourse.title,
        subscription: course.subscription,
      });
    }
    delete response.courses;

    for (const spec of response.specs) {
      const originalSpec = await Spec.findById(spec.spec_id).exec();
      const nObj = {
        _id: originalSpec._id,
        title: originalSpec.title,
        thumb: originalSpec.thumb,
        instructor: originalSpec.instructor,
        description: originalSpec.description.text,
        categories: originalSpec.categories,
        type: 'spec',
      };
      if (spec.is_completed) {
        nObj.progress = `${originalSpec.courses.length}`;
        nObj.progress += `/${nObj.progress}`;
        nObj.progress_bar = 100;

        response.completed.push(nObj);
      } else {
        nObj.progress = `${spec.courses.length}/${originalSpec.courses.length}`;
        nObj.progress_bar = originalSpec.courses.length <= 0 ? 0 : Math.round(spec.courses.length / originalSpec.courses.length);

        response.inprogress.push(nObj);
      }
      response.purchase.push({
        _id: originalSpec._id,
        title: originalSpec.title,
        subscription: spec.subscription,
      });
    }
    delete response.specs;

    return successfulRes(res, 200, response);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.profileUpdate = async (req, res) => {
  try {
    const { _id } = req.session.user;
    const { first_name, last_name, email, phone, photo } = req.body;

    let doc = await User.findById(_id).exec();

    doc.first_name = first_name ? first_name : doc.first_name;
    doc.last_name = last_name ? last_name : doc.last_name;
    doc.email = email ? email : doc.email;
    doc.phone = phone ? phone : doc.phone;
    doc.photo = photo ? photo : doc.photo;

    const valid = doc.validateSync();
    if (valid) throw valid;
    await doc.save();
    doc.password = undefined;
    req.session.user = doc;
    return successfulRes(res, 200, doc);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.profileDelete = async (req, res) => {
  try {
    const { _id } = res.session.user;

    const response = await User.findByIdAndDelete(_id).exec();

    return successfulRes(res, 200, response);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const course_id = req.params.course_id;
    const user = req.session.user;

    let error;
    for (const course of user.courses) {
      if (course.course_id == course_id) {
        if (course.is_completed) {
          error = new Error('Your have already completed to this course');
        }
        error = new Error('Your have already enrolled to this course');
        return failedRes(res, 400, error);
      }
    }

    const course = await Course.findById(course_id).exec();
    if (!course) return failedRes(res, 404, new Error(`Can NOT find course#${course_id}`));

    if (course.membership != 'free' && course.instructor._id != user._id) {
      return res.redirect(`/course/`);
    }

    await User.findByIdAndUpdate(user._id, {
      $push: { courses: { course_id } },
    }).exec();
    user.courses.push({
      course_id,
    });

    return res.redirect(`/course/${course_id}`);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.completeCourse = async (req, res) => {
  try {
    const course_id = req.params.course_id;
    const user = req.session.user;

    for (const e of user.courses) {
      if (e.course_id == course_id && e.is_completed) return failedRes(res, 400, new Error('Your have already completed to this course'));
    }

    const course = await Course.findById(course_id).exec();
  } catch (e) {
    return failedRes(res, 500, e);
  }
};
