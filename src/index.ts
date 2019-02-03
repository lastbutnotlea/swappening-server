import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import { userRouter } from "./routers/user.router";
import { tokenGuard } from "./middlewares/token-guard";
import { fileRouter } from "./routers/fileHandling.router";
import { eventRouter } from "./routers/event.router";
import { tagRouter } from "./routers/tag.router";
import { chatRouter } from "./routers/chat.router";

// app
const app = express();
const server = require("http").createServer(app);

// Setup server port
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions =  {
  origin: ["http://localhost:80"],
  credentials: true,
};
app.use(cors());
app.use("/", userRouter);

app.use("/files", fileRouter);

app.use(tokenGuard());

app.use("/chat", chatRouter);

app.use("/event", eventRouter);

app.use("/tag", tagRouter);

// Protected Get
app.get("/some-protected-resource", (req: Request, res: Response, next) => {
  res.json("Protected Hello World");
});


app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
