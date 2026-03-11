var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');

// GET /api/v1/users - Lấy tất cả users (không bị xoá mềm)
router.get('/', async function (req, res, next) {
  try {
    let result = await userModel.find({ isDeleted: false }).populate({
      path: 'role',
      select: 'name description'
    });
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Lỗi server", error });
  }
});

// GET /api/v1/users/:id - Lấy user theo id
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await userModel.findById(id).populate({
      path: 'role',
      select: 'name description'
    });
    if (!result || result.isDeleted) {
      return res.status(404).send({ message: "ID NOT FOUND" });
    }
    res.send(result);
  } catch (error) {
    res.status(404).send({ message: "ID NOT FOUND" });
  }
});

// POST /api/v1/users - Tạo user mới
router.post('/', async function (req, res, next) {
  try {
    let newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      status: req.body.status,
      role: req.body.role,
      loginCount: req.body.loginCount
    });
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    res.status(400).send({ message: "Tạo user thất bại", error });
  }
});

// PUT /api/v1/users/:id - Cập nhật user theo id
router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await userModel.findById(id);
    if (!result || result.isDeleted) {
      return res.status(404).send({ message: "ID NOT FOUND" });
    }
    let updated = await userModel.findByIdAndUpdate(id, req.body, { new: true });
    res.send(updated);
  } catch (error) {
    res.status(400).send({ message: "Cập nhật user thất bại", error });
  }
});

// DELETE /api/v1/users/:id - Xoá mềm user theo id
router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await userModel.findById(id);
    if (!result || result.isDeleted) {
      return res.status(404).send({ message: "ID NOT FOUND" });
    }
    result.isDeleted = true;
    await result.save();
    res.send({ message: "Xoá mềm user thành công", data: result });
  } catch (error) {
    res.status(404).send({ message: "ID NOT FOUND" });
  }
});

// POST /api/v1/users/enable - Kích hoạt user (chuyển status -> true)
// Body: { email, username }
router.post('/enable', async function (req, res, next) {
  try {
    let { email, username } = req.body;

    // Kiểm tra đầu vào
    if (!email || !username) {
      return res.status(400).send({ message: "Vui lòng cung cấp đủ email và username" });
    }

    // Tìm user khớp cả email lẫn username, chưa bị xoá mềm
    let user = await userModel.findOne({ email, username, isDeleted: false });

    if (!user) {
      return res.status(404).send({ message: "Thông tin email hoặc username không đúng" });
    }

    // Nếu đã active rồi
    if (user.status === true) {
      return res.status(400).send({ message: "Tài khoản đã được kích hoạt trước đó" });
    }

    // Chuyển status -> true
    user.status = true;
    await user.save();

    res.send({ message: "Kích hoạt tài khoản thành công", data: user });
  } catch (error) {
    res.status(500).send({ message: "Lỗi server", error });
  }
});

// POST /api/v1/users/disable - Vô hiệu hoá user (chuyển status -> false)
// Body: { email, username }
router.post('/disable', async function (req, res, next) {
  try {
    let { email, username } = req.body;

    // Kiểm tra đầu vào
    if (!email || !username) {
      return res.status(400).send({ message: "Vui lòng cung cấp đủ email và username" });
    }

    // Tìm user khớp cả email lẫn username, chưa bị xoá mềm
    let user = await userModel.findOne({ email, username, isDeleted: false });

    if (!user) {
      return res.status(404).send({ message: "Thông tin email hoặc username không đúng" });
    }

    // Nếu đã inactive rồi
    if (user.status === false) {
      return res.status(400).send({ message: "Tài khoản đã bị vô hiệu hoá trước đó" });
    }

    // Chuyển status -> false
    user.status = false;
    await user.save();

    res.send({ message: "Vô hiệu hoá tài khoản thành công", data: user });
  } catch (error) {
    res.status(500).send({ message: "Lỗi server", error });
  }
});

module.exports = router;


