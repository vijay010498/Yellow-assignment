import { app } from "./app";

const start = () => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log("SERVER STARTED ON PORT 5000");
  });
};

start();
