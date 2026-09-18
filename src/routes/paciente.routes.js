const router = require("express").Router();
const controller = require("../controllers/paciente.controller");
const { requireRole } = require("../middleware/auth");

router.use(requireRole("ROLE_ADMIN", "ROLE_MEDICO"));

router.get("/", controller.listar);
router.get("/:idPaciente", controller.buscarPorId);
router.post("/", controller.cadastrarPaciente);
router.put("/:idPaciente", controller.atualizarPaciente);
router.delete("/:idPaciente", controller.deletarPaciente);

module.exports = router;
