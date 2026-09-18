const router = require("express").Router();
const controller = require("../controllers/sintoma.controller");
const { requireRole } = require("../middleware/auth");

router.use(requireRole("ROLE_ADMIN", "ROLE_MEDICO"));

router.get("/", controller.listar);
router.get("/:id", controller.buscarPorId);
router.post("/", controller.cadastrar);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.deletar);

module.exports = router;
