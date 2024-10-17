import express from "express";
import "dotenv/config";
import { userRoutes } from "./api/users/user.routes";

const app = express();

app.use(express.json());

const port = process.env.PORT || 7554;

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Server is healthy" });
});

app.use("/api/v1/user", userRoutes);

app.listen(port, () => {
  return console.log(`Listening on localhost:${port}`);
});
