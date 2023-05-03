import express from 'express';
const router = express.Router();
import { getAllProducts, getProductDetails, updateProduct, deleteProduct, getProductReviews, deleteReview, createProductReview, createProduct, getAdminProducts, getProducts } from '../controllers/productMarketController.js';


router.route('/products').get(getAllProducts);
router.route('/products/all').get(getProducts);

router.route('/admin/products').get( getAdminProducts);
router.route('/admin/product/new').post( createProduct);

router.route('/admin/product/:id')
    .put(updateProduct)
    .delete(deleteProduct);

router.route('/product/:id').get(getProductDetails);

router.route('/review').put( createProductReview);

router.route('/admin/reviews')
    .get(getProductReviews)
    .delete(deleteReview);

export default router;