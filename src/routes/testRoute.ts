import express, { Request, Response } from "express";
const router = express.Router({
  caseSensitive: true,
});

router.get("/api/test", async (req: Request, res: Response) => {
  res.status(200).send({
    message: "TEST SUCCESS",
  });
  return;
});

export { router as testRouter };
