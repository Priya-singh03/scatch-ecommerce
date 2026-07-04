const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");

router.post("/create", upload.single("image"), async (req, res) => {
    try {

        if (!req.file) {
            req.flash("success", "Please select an image first.");
            return res.redirect("/owners/admin");
        }

        const { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

        await productModel.create({
            image: req.file.buffer,
            name,
            price,
            discount,
            bgcolor,
            panelcolor,
            textcolor,
        });

        req.flash("success", "Product created successfully");
        res.redirect("/owners/admin");

    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});

module.exports = router;