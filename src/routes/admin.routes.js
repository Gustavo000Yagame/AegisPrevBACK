const router = require("express").Router();
const controller = require("../controllers/admin.controller");
const { requireRole } = require("../middleware/auth");

router.use(requireRole("ROLE_ADMIN"));

router.get("/dashboard/top-doencas", controller.top10Doencas);
router.get("/dashboard/top-medicos", controller.rankingMedicos);
router.put("/usuario/:id/remover-admin", controller.removerAdmin);
router.put("/usuario/:id/admin-semana", controller.adminUmaSemana);
router.put("/usuario/:id/admin-mes", controller.adminUmMes);
router.put("/usuario/:id/admin-permanente", controller.adminPermanente);

module.exports = router;
