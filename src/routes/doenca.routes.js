const router = require("express").Router();
const controller = require("../controllers/doenca.controller");
const { requireRole } = require("../middleware/auth");

router.use(requireRole("ROLE_ADMIN", "ROLE_MEDICO"));

router.get("/", controller.listar);
router.get("/:id", controller.pegarId);
router.post("/", controller.salvar);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.deletar);

module.exports = router;
