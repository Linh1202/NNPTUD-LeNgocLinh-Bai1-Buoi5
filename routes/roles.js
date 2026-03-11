var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users');

// GET /api/v1/roles - Lấy tất cả roles (không bị xoá mềm)
router.get('/', async function (req, res, next) {
    try {
        let result = await roleModel.find({ isDeleted: false });
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Lỗi server", error });
    }
});

// GET /api/v1/roles/:id - Lấy role theo id
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findById(id);
        if (!result || result.isDeleted) {
            return res.status(404).send({ message: "ID NOT FOUND" });
        }
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
});

// POST /api/v1/roles - Tạo role mới
router.post('/', async function (req, res, next) {
    try {
        let newRole = new roleModel({
            name: req.body.name,
            description: req.body.description
        });
        await newRole.save();
        res.status(201).send(newRole);
    } catch (error) {
        res.status(400).send({ message: "Tạo role thất bại", error });
    }
});

// PUT /api/v1/roles/:id - Cập nhật role theo id
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findById(id);
        if (!result || result.isDeleted) {
            return res.status(404).send({ message: "ID NOT FOUND" });
        }
        let updated = await roleModel.findByIdAndUpdate(id, req.body, { new: true });
        res.send(updated);
    } catch (error) {
        res.status(400).send({ message: "Cập nhật role thất bại", error });
    }
});

// DELETE /api/v1/roles/:id - Xoá mềm role theo id
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findById(id);
        if (!result || result.isDeleted) {
            return res.status(404).send({ message: "ID NOT FOUND" });
        }
        result.isDeleted = true;
        await result.save();
        res.send({ message: "Xoá mềm role thành công", data: result });
    } catch (error) {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
});

// GET /api/v1/roles/:id/users - Lấy tất cả users thuộc role có id tương ứng
router.get('/:id/users', async function (req, res, next) {
    try {
        let id = req.params.id;

        // Kiểm tra role có tồn tại và chưa bị xoá mềm không
        let role = await roleModel.findById(id);
        if (!role || role.isDeleted) {
            return res.status(404).send({ message: "Role không tồn tại" });
        }

        // Lấy tất cả user thuộc role này, chưa bị xoá mềm
        let users = await userModel.find({ role: id, isDeleted: false }).populate({
            path: 'role',
            select: 'name description'
        });

        res.send({
            role: { id: role._id, name: role.name },
            totalUsers: users.length,
            users
        });
    } catch (error) {
        res.status(500).send({ message: "Lỗi server", error });
    }
});

module.exports = router;
