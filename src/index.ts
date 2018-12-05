// FileName: index.ts
// Import express
import * as express from "express";
import {Request, Response} from "express";

// Import routes
import * as apiRoutes from './api-routes';


const app = express();
// Use Api routes in the App
app.use('/api', apiRoutes);

// Setup server port
const port = process.env.PORT || 8080;
// Send message for default URL
// @ts-ignore
app.get('/', (req:Request, res:Response) => res.send('Hello World with Express'));
// Launch app to listen to specified port
app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Running RestHub on port ${port}`);
});
