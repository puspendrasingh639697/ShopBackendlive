import express from 'express';
import { 
  addTemple, 
  getNearbyTemples, 
  checkProximity, 
  getTempleDetails, 
  fetchTemplesFromOSM 
} from '../controllers/templeController.js';

const router = express.Router();

router.get('/nearby', getNearbyTemples);
router.post('/check-proximity', checkProximity);
router.post('/add', addTemple);
router.get('/fetch-osm', fetchTemplesFromOSM);
router.get('/:templeId/details', getTempleDetails);

export default router;