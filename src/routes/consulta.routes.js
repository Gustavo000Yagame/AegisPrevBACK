const router = require("express").Router();
const controller = require("../controllers/consulta.controller");
const { requireRole } = require("../middleware/auth");

router.get("/admin/consultas", requireRole("ROLE_ADMIN"), controller.listarAdmin);
router.get("/", requireRole("ROLE_MEDICO"), controller.listarMedico);
router.get("/:id", requireRole("ROLE_ADMIN", "ROLE_MEDICO"), controller.pegarId);
router.post("/", requireRole("ROLE_ADMIN", "ROLE_MEDICO"), controller.cadastrar);
router.put("/:id", requireRole("ROLE_ADMIN", "ROLE_MEDICO"), controller.atualizar);
router.delete("/:id", requireRole("ROLE_ADMIN"), controller.deletar);

module.exports = router;
