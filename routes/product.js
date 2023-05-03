import express from 'express';
import { addProduct, updateProductById, deleteProductById, getProductById, getProducts,getMyProducts,getOtherProducts } from '../controllers/productController.js';
import { getTopBidderProduct } from '../controllers/productController.js';

const router = express.Router();

router.route('/').get(getProducts).post(addProduct);
router.route('/:id').get(getProductById).put( updateProductById).delete( deleteProductById);
router.route('/topBidders/:id')
    .get(getTopBidderProduct)

router.route('/myproducts/:id').get(getMyProducts);  
router.route('/otherproducts/:id').get(getOtherProducts);    
export default router;
