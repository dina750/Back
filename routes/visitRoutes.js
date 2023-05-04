import express from 'express'
import {
  getvisits,
  getvisitById,
  deletevisit,
  createvisit,
  updatevisit,
  getVisitBySearch,
  getFeaturedVisits,
  setVisitConfirmed
}
  from './../controllers/visitController.js'
import Visit from '../models/visitModel.js'
const router = express.Router()

router
  .route('/add')
  .post(createvisit)
//.get(protect, admin, getProducts)

router
  .route('/all')
  .get(getvisits)


router
  .route('/visit/:id')
  .get(getvisitById)


router
  .route('/edit/:id')
  .put(updatevisit)


router
  .route('/setState/:id')
  .put(setVisitConfirmed)

router
  .route('/delete/:id')
  .delete(deletevisit)
router
  .route('/getVisitByS')
  .get(getVisitBySearch)
router
  .route('/getFeatured')
  .get(getFeaturedVisits)
router
  .get('/search', async (req, res) => {
    const searchText = req.query.query;
    if (!searchText) {
      res.status(400).json({ message: 'Query parameter is required' });
    } else {
      const regex = new RegExp(searchText, 'i');
      try {
        const visits = await Visit.find({
          $or: [
            { title: { $regex: regex } },
            { city: { $regex: regex } },
            { address: { $regex: regex } },
            { price: { $eq: parseInt(searchText) } },
            { maxGroupSize: { $eq: parseInt(searchText) } },

          ],
        });
        res.status(200).json(visits);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve visits' });
      }
    }
  });
  
  

router.get('/search-numbers', async (req, res) => {
  const searchText = req.query.query;
  if (!searchText) {
    res.status(400).json({ message: 'Query parameter is required' });
  } else {
    try {
      const number = Number(searchText);
      const visits = await Visit.find({
        $or: [
          { title: { $regex: searchText, $options: 'i' } },
          { city: { $regex: searchText, $options: 'i' } },
          { address: { $regex: searchText, $options: 'i' } },
          { price: { $gte: number, $lte: number } },
          { maxGroupSize: { $gte: number, $lte: number } },
        ],
      });
      res.status(200).json(visits);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve visits' });
    }
  }
});



/*router
    .route('/product/:id/reviews')
    .post(protect, admin, createFarmerProductReview)
    .put(protect, admin, updateProductReviewed)*/

export default router