// FileName: index.ts
// Import express
import * as express from "express";
import {Request, Response} from "express";
import { sequelize } from "./instances/sequelize";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import { userRouter } from "./routers/user.router";
import { tokenGuard } from "./middlewares/token-guard";

// Import routes
import * as apiRoutes from "./api-routes";


const app = express();
// Use Api routes in the App
app.use("/api", apiRoutes);

// Setup server port
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/", userRouter);

// Unprotected Get
app.get("/some-resource", (req: Request, res: Response, next) => {
  res.json("Hello World");
});
app.use(tokenGuard());

// Protected Get
app.get("/some-protected-resource", (req: Request, res: Response, next) => {
  res.json("Protected Hello World");
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

// TODO: Delete this later
sequelize.toString();
