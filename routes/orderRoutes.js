import express from 'express'
const router = express.Router()

import { 
    addOrderItems, 
    getOrderById, 
    updateOrderToPaid, 
    getMyOrders, 
    getOrders,
    updateOrderToDelivered
} from '../controllers/orderController.js'
import { protect, admin } from './../middleware/authMiddleware.js'

router.route('/').post( addOrderItems).get( getOrders)
router.route('/myorders').get( getMyOrders)
router.route('/:id').get(getOrderById)
router.route('/:id/pay').put(updateOrderToPaid)
router.route('/:id/deliver').put( updateOrderToDelivered)

export default router