export {};
import { NextFunction, Request, Response, Router } from 'express';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const httpStatus = require('http-status');
const { omit } = require('lodash');
import { User, Discussion } from '../../api/models';
import { apiJson } from '../../api/utils/Utils';
const { handler: errorHandler } = require('../middlewares/error');

const likesMap: any = {}; // key (userId__noteId) : 1

/**
 * Load user and append to req.
 * @public
 */
exports.load = async (req: Request, res: Response, next: NextFunction, id: any) => {
  try {
    const user = await User.get(id);
    req.route.meta = req.route.meta || {};
    req.route.meta.user = user;
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get logged in user info
 * @public
 */
const loggedIn = (req: Request, res: Response) => res.json(req.route.meta.user.transform());
exports.loggedIn = loggedIn;

/**
 * Get user
 * @public
 */
exports.get = loggedIn;

/**
 * Create new user
 * @public
 */
exports.create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/****create -user */

exports.findOneUserBYid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const savedUser = await User.findById(req.params.id).populate('followed followers');
  
    return res.status(200).json(savedUser);
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};


exports.findAllUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const savedUser = await User.find().populate('followed followers');
    console.log(savedUser);
    
    return res.status(200).json(savedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};

exports.findAllUserDesactivated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const savedUser = await User.find({status:"desactivate"}).populate('followed followers');
  
    return res.status(200).json(savedUser);
  } catch (error) {
    console.log(error);
    
    return res.status(400).json(error);
    
  }
};


exports.findOneUserAnddes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const savedUser = await User.findById(req.params._id).populate('followed followers');
    savedUser.status = "desactivate"
    return res.status(200).json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Replace existing user
 * @public
 */
exports.replace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user } = req.route.meta;
    const newUser = new User(req.body);
    const ommitRole = user.role !== 'admin' ? 'role' : '';
    const newUserObject = omit(newUser.toObject(), '_id', ommitRole);

    await user.update(newUserObject, { override: true, upsert: true });
    const savedUser = await User.findById(user._id);

      res.json(savedUser.transform());
  } catch (error) {
    next(User.checkDuplicateEmail(error));
  }
};

/**
 * Update existing user
 * @public
 */
exports.update = (req: Request, res: Response, next: NextFunction) => {
  const ommitRole = req.route.meta.user.role !== 'admin' ? 'role' : '';
  const updatedUser = omit(req.body, ommitRole);
  const user = Object.assign(req.route.meta.user, updatedUser);

  user
    .save()
    .then((savedUser: any) => res.json(savedUser.transform()))
    .catch((e: any) => next(User.checkDuplicateEmail(e)));
};

/**
 * Get user list
 * @public
 * @example GET /v1/users?role=admin&limit=5&offset=0&sort=email:desc,createdAt
 */
exports.list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = (await User.list(req)).transform(req);
    apiJson({ req, res, data, model: User });
  } catch (e) {
    next(e);
  }
};

/**
 * Get user's notes.
 * @public
 * @example GET /v1/users/userId/notes
 */
exports.listUserNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    req.query = { ...req.query, user: new ObjectId(userId) }; // append to query (by userId) to final query
    const data = (await Discussion.list({ query: req.query })).transform(req);
    apiJson({ req, res, data, model: Discussion });
  } catch (e) {
    next(e);
  }
};

/**
 * Read a user's note.
 * NOTE: Any logged in user can get a list of notes of any user. Implement your own checks.
 * @public
 * @example GET /v1/users/userId/notes/noteId
 */
exports.readUserNote = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, noteId } = req.params;
  const { _id } = req.route.meta.user;
  const currentUserId = _id.toString();
  if (userId !== currentUserId) {
    return next(); // only logged in user can delete her own notes
  }
  try {
    const data = await Discussion.findOne({ user: new ObjectId(userId), _id: new ObjectId(noteId) });
    apiJson({ req, res, data });
  } catch (e) {
    next(e);
  }
};

/**
 * Update a user's note.
 * @public
 * @example POST /v1/users/userId/notes/noteId
 */
exports.updateUserNote = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, noteId } = req.params;
  const { _id } = req.route.meta.user;
  const { note } = req.body;
  const currentUserId = _id.toString();
  if (userId !== currentUserId) {
    return next(); // only logged in user can delete her own notes
  }
  try {
    const query = { user: new ObjectId(userId), _id: new ObjectId(noteId) };
    await Discussion.findOneAndUpdate(query, { note }, {});
    apiJson({ req, res, data: {} });
  } catch (e) {
    next(e);
  }
};

/**
 * Delete user note
 * @public
 */
exports.deleteUserNote = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, noteId } = req.params;
  const { _id } = req.route.meta.user;
  const currentUserId = _id.toString();
  if (userId !== currentUserId) {
    return next(); // only logged in user can delete her own notes
  }
  try {
    await Discussion.remove({ user: new ObjectId(userId), _id: new ObjectId(noteId) });
    apiJson({ req, res, data: {} });
  } catch (e) {
    next(e);
  }
};

/**
 * Like user note
 * @public
 */
// exports.likeUserNote = async (req: Request, res: Response, next: NextFunction) => {
//   const { noteId } = req.params;
//   const { _id } = req.route.meta.user;
//   const currentUserId = _id.toString();
//   if (likesMap[`${currentUserId}__${noteId}`]) {
//     return next(); // already liked => return.
//   }
//   try {
//     const query = { _id: new ObjectId(noteId) };
//     const dbItem = await UserNote.findOne(query);
//     const newLikes = (dbItem.likes > 0 ? dbItem.likes : 0) + 1;

//     await UserNote.findOneAndUpdate(query, { likes: newLikes }, {});
//     likesMap[`${currentUserId}__${noteId}`] = 1; // flag as already liked.
//     apiJson({ req, res, data: {} });
//   } catch (e) {
//     next(e);
//   }
// };

/**
 * Delete user
 * @public
 */
exports.remove = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.route.meta;
  user
    .remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch((e: any) => next(e));
};
exports.followUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log("dfff");
  
  const { user } = req.route.meta;
  const { userId } = req.params;
  try {
    if (userId == user._id) {
      const error = new Error("you can't follow yourself");

      return next(error);
    }
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      const error = new Error('User to follow not found');

      return next(error);
    }

    // Check if the user is already followed
    if (user.followed.includes(userId)) {
      const error = new Error('User is already followed');

      return res.status(403).json('User is already followed');
    }

    user.followed.push(userToFollow._id);
    userToFollow.followers.push(user._id);
    await userToFollow.save();

    await user.save();

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Unfollow a user
 * @public
 */
exports.unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.route.meta;
  const { userId } = req.params;

  try {
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
      const error = new Error('User to unfollow not found');
      return next(error);
    }

    // Check if the user is already followed
    const index = user.followed.indexOf(userId);
    if (index === -1) {
      const error = new Error('User is not followed');
      return next(error);
    }

    user.followed.splice(index, 1);
    userToUnfollow.followers.pull(user._id);
    await userToUnfollow.save();
    await user.save();

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get followers of a user
 * @public
 */
exports.getFollowers = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate('followers', 'name email');
    if (!user) {
      const error = new Error('User not found');
      return next(error);
    }

    res.json({ followers: user.followers });
  } catch (error) {
    next(error);
  }
};

/**
 * Get users followed by a user
 * @public
 */
exports.getFollowedUsers = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate('followed', 'name email');
    if (!user) {
      const error = new Error('User not found');
      return next(error);
    }

    res.json({ followed: user.followed });
  } catch (error) {
    next(error);
  }
};



/**** */


exports.getFileImageName = async (req:any, res:any) => {
  try{
    console.log("ddddddddddd",req.file);
    
    if (!req.file) {
      const error = new Error("No File");
      console.log(error);
      
      return res.status(400).json(error)
    }
    
    const er = await User.findById(req.route.meta.user._id)
    er.picture ='https://seragii.com/uploads/' + req.file.originalname;
    er.save();
    res.status(200).json(req.file.originalname);

  }catch(err){
    console.log(err);
    
    res.status(400).json('err')
  }

};


exports.isFollowing = async (req:any,res:any) => {

  try {
      let userId = req.route.meta.user._id
      let followerId = req.params.userId

      const currentUser = await User.findById(followerId);
  
      if (!currentUser) {
          return res.status(401).json({ err: 'Current user not found'})

      }

    // Check if the current user is following the other user
    let status = currentUser.followers.includes(userId) ? true : false;
    return res.status(200).json({status});

  } catch (error) {
    console.error('Error:', error.message);

    return res.status(401).json({status});
  }

}