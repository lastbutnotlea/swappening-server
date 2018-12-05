// Filename: api-routes.js
// Initialize express router
import { Request, Response, Router } from 'express';

const router = Router();
// Set default API response
// @ts-ignore
router.get('/', (req:Request, res:Response) => {
  res.json({
    status: 'API Its Working',
    message: 'Welcome to RESTHub crafted with love!',
    }
  );
});
// Export API routes
module.exports = router;
