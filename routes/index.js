const express = require("express");
const router = express.Router();
const isloggedin = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");


router.get("/", function (req, res) {
    let error = req.flash("error");
    res.render("index", {error, loggedin: false});
});

router.get("/shop", isloggedin, async function(req, res){
    let products = await productModel.find();
    let success = req.flash("success");
    res.render("shop", {products, success});
});

router.get("/cart", isloggedin, async function(req, res){ 
    let user = await userModel
        .findOne({email: req.user.email})
        .populate("cart");

    // Group same product ids together to get quantity
    let groupedItems = {};

    user.cart.forEach(product => {
        const id = product._id.toString();
        if (groupedItems[id]) {
            groupedItems[id].quantity += 1;
        } else {
            groupedItems[id] = {
                ...product._doc,
                quantity: 1
            };
        }
    });

    let items = Object.values(groupedItems);

    let grandTotal = 0;
    items.forEach(item => {
        item.itemTotal = (item.price - (item.discount || 0)) * item.quantity;
        grandTotal += item.itemTotal;
    });

    grandTotal += 20; // platform fee

    res.render("cart", { items, grandTotal });
});

router.get("/addtocart/:productid", isloggedin, async function(req, res){
    let user = await userModel.findOne({email: req.user.email});
    user.cart.push(req.params.productid);
    await user.save();
    req.flash("success", "Added to cart");
    res.redirect("/shop");
});

router.get("/cart/increment/:productid", isloggedin, async function(req, res){
    let user = await userModel.findOne({email: req.user.email});
    user.cart.push(req.params.productid);
    await user.save();
    res.redirect("/cart");
});

router.get("/cart/decrement/:productid", isloggedin, async function(req, res){
    let user = await userModel.findOne({email: req.user.email});

    // remove sirf ek instance us productid ka
    const index = user.cart.findIndex(id => id.toString() === req.params.productid);
    if (index !== -1) {
        user.cart.splice(index, 1);
    }

    await user.save();
    res.redirect("/cart");
});

router.get("/logout", isloggedin, function(req, res){
    res.render("shop");
});

router.get("/account", isloggedin, async function(req, res){
    let user = await userModel.findOne({email: req.user.email}).populate("cart");

    res.render("account", { user });
});
module.exports = router;