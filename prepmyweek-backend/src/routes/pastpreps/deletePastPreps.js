import { prisma } from "../../prismaClient.js";

export const deletePastPrep = async (req, res) => {
  try {
    const userId = req.user.userId;
    const pastPrepId = parseInt(req.params.id);

    if (isNaN(pastPrepId)) {
      return res.status(400).json({ errpr: "Invalid past prep ID" });
    }

    //Confirm the past prep belongs to the user
    const pastPrep = await prisma.pastPrep.findUnique({
      where: { id: pastPrepId },
    });

    if (!pastPrep || pastPrep.userId !== userId) {
      return res.status(404).json({ error: "Past prep not found" });
    }

    //DELETE the past prep (this should cascade)
    await prisma.pastPrep.delete({
      where: { id: pastPrepId },
    });

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting past prep:", err);
    res.status(500).json({ error: "Failed to delete past prep" });
  }
};
