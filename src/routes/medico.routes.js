const router = require("express").Router();
const controller = require("../controllers/medico.controller");
const { requireRole } = require("../middleware/auth");

router.get("/", requireRole("ROLE_ADMIN"), controller.listar);
router.get("/email", requireRole("ROLE_ADMIN"), controller.buscarPorEmail);
router.get("/me", requireRole("ROLE_ADMIN", "ROLE_MEDICO"), controller.me);
router.get("/:idMedico", requireRole("ROLE_ADMIN", "ROLE_MEDICO"), controller.buscarPorId);

// Cadastro (assim como no backend original) é público: é o "Cadastrar" da tela de login.
router.post("/", controller.criar);

router.put("/:idMedico", requireRole("ROLE_ADMIN", "ROLE_MEDICO"), controller.atualizar);
router.delete("/:idMedico", requireRole("ROLE_ADMIN"), controller.deletar);

module.exports = router;
