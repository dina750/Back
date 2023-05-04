import express from 'express'
import {
    deleteProjectIdeaById,
    updateProjectIdeaById,
    getAllProjectIdeas,
    getProjectIdeaById,
    createProjectIdea,
    createDonation,
    getDonationsForProjectIdea,
    getDonationById,
    getMyProjectIdeas,
    getTopTenDonationsForProjectIdea,
    getTopDonationsForProject
} from '../controllers/fundMeController.js'
const router = express.Router()

router
    .route('/createProject')
    .post( createProjectIdea)
    .get(getAllProjectIdeas);

router
    .route('/projects')
    .get(getAllProjectIdeas);

router
    .route('/projects/:id')
    .get( getProjectIdeaById);

router
    .route('/myProjects/:id')
    .get(getMyProjectIdeas);
router
    .route('/updateProjects/:id')
    .put(updateProjectIdeaById); 


router
    .route('/deleteProjects/:id')
    .delete(deleteProjectIdeaById); 

router
    .route('/createDonation/:id')
    .post(createDonation);

router
    .route('/donationbyproject/:id')
    .get(getDonationsForProjectIdea);

    router
    .route('/toptendonationbyproject')
    .get(getTopTenDonationsForProjectIdea);

router
    .route('/topDonations/:id')
    .get(getTopDonationsForProject);
router
    .route('/donationbyid').
    get(getDonationById)


export default router